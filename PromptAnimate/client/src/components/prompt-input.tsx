import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PromptInputProps {
  onParametersGenerated: (parameters: {
    shape: "circle" | "square" | "triangle";
    color: "red" | "blue" | "green" | "purple" | "yellow";
    animationType: "grow" | "rotate" | "fade" | "move" | "pulse";
    duration: number;
    manimCode: string;
  }) => void;
}

const samplePrompts = [
  "Red square rotating clockwise",
  "Green triangle moving right", 
  "Purple circle fading in and out",
  "Blue circle that grows and fades",
  "Yellow triangle spinning for 5 seconds"
];

export default function PromptInput({ onParametersGenerated }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  
  const parsePromptMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/parse-prompt", { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      onParametersGenerated(data);
      toast({
        title: "Prompt parsed successfully!",
        description: "Parameters have been generated from your prompt.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to parse prompt",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the animation you want to create.",
        variant: "destructive",
      });
      return;
    }
    parsePromptMutation.mutate(prompt);
  };

  const handleSampleClick = (samplePrompt: string) => {
    setPrompt(samplePrompt);
  };

  return (
    <Card className="glass-card border-border/50 backdrop-blur-lg">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-lg shadow-purple-500/25">
            1
          </div>
          <h3 className="text-lg font-semibold">Describe Your Animation</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Natural Language Prompt
            </label>
            <Textarea
              placeholder="e.g., animate a blue circle that grows and fades out over 3 seconds"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
              rows={3}
            />
          </div>
          
          {/* Sample Prompts */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleClick(sample)}
                  className="bg-background/50 border-border text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={parsePromptMutation.isPending}
            className="w-full gradient-primary text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {parsePromptMutation.isPending ? "Generating..." : "Generate Parameters"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
