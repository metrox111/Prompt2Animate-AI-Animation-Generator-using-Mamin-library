import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Video, Code, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ParameterEditorProps {
  parameters: {
    shape: "circle" | "square" | "triangle";
    color: "red" | "blue" | "green" | "purple" | "yellow";
    animationType: "grow" | "rotate" | "fade" | "move" | "pulse";
    duration: number;
    manimCode: string;
  };
  onParametersChange: (parameters: typeof parameters) => void;
  onRender: (isRendering: boolean) => void;
  onVideoGenerated: (videoUrl: string) => void;
}

const colorMap = {
  red: "bg-red-500",
  blue: "bg-blue-500", 
  green: "bg-green-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500"
};

export default function ParameterEditor({ 
  parameters, 
  onParametersChange, 
  onRender, 
  onVideoGenerated 
}: ParameterEditorProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { toast } = useToast();
  
  const renderMutation = useMutation({
    mutationFn: async (config: typeof parameters) => {
      const response = await apiRequest("POST", "/api/render", config);
      return response.json();
    },
    onMutate: () => {
      onRender(true);
    },
    onSuccess: (data) => {
      onRender(false);
      onVideoGenerated(data.videoUrl);
      toast({
        title: "Animation rendered successfully!",
        description: "Your animation is ready to preview.",
      });
    },
    onError: (error) => {
      onRender(false);
      toast({
        title: "Failed to render animation",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const updateParameter = <K extends keyof typeof parameters>(
    key: K, 
    value: typeof parameters[K]
  ) => {
    onParametersChange({ ...parameters, [key]: value });
  };

  const handleRender = () => {
    renderMutation.mutate(parameters);
  };

  return (
    <Card className="glass-card border-border/50 backdrop-blur-lg">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-lg shadow-emerald-500/25">
            2
          </div>
          <h3 className="text-lg font-semibold">Customize Parameters</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Shape Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Shape</label>
            <Select value={parameters.shape} onValueChange={(value: typeof parameters.shape) => updateParameter("shape", value)}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Color</label>
            <div className="flex space-x-2">
              {(Object.keys(colorMap) as Array<keyof typeof colorMap>).map((color) => (
                <button
                  key={color}
                  onClick={() => updateParameter("color", color)}
                  className={`w-10 h-10 ${colorMap[color]} rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    parameters.color === color ? "border-foreground shadow-lg" : "border-transparent hover:border-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Animation Type */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Animation Type</label>
            <Select value={parameters.animationType} onValueChange={(value: typeof parameters.animationType) => updateParameter("animationType", value)}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="grow">Grow</SelectItem>
                <SelectItem value="rotate">Rotate</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="move">Move</SelectItem>
                <SelectItem value="pulse">Pulse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Duration</label>
            <div className="flex items-center space-x-3">
              <Slider
                value={[parameters.duration]}
                onValueChange={([value]) => updateParameter("duration", value)}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-8">{parameters.duration}s</span>
            </div>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center text-muted-foreground hover:text-foreground p-0">
                <Code className="mr-2 h-4 w-4" />
                <span>Advanced: Edit Manim Code</span>
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <Textarea
                value={parameters.manimCode}
                onChange={(e) => updateParameter("manimCode", e.target.value)}
                placeholder="# Generated Manim code will appear here..."
                className="bg-background/50 border-border text-emerald-400 font-mono text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                rows={8}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <Button 
          onClick={handleRender}
          disabled={renderMutation.isPending}
          className="w-full mt-6 gradient-secondary text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Video className="mr-2 h-4 w-4" />
          {renderMutation.isPending ? "Rendering..." : "Render Animation"}
        </Button>
      </CardContent>
    </Card>
  );
}
