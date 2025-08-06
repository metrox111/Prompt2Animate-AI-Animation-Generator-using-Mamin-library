import { useQuery } from "@tanstack/react-query";
import { Play, Circle, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Animation } from "@shared/schema";

const ShapeIcon = ({ shape }: { shape: string }) => {
  switch (shape) {
    case "circle":
      return <Circle className="h-3 w-3 text-white" />;
    case "square":
      return <Square className="h-3 w-3 text-white" />;
    case "triangle":
      return <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent"></div>;
    default:
      return <Circle className="h-3 w-3 text-white" />;
  }
};

const colorMap = {
  red: "from-red-500 to-red-600",
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600", 
  purple: "from-purple-500 to-purple-600",
  yellow: "from-yellow-500 to-yellow-600"
};

export default function RecentAnimations() {
  const { data: animations = [], isLoading } = useQuery<Animation[]>({
    queryKey: ["/api/animations/recent"],
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-border/50 backdrop-blur-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Animations</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="w-12 h-8 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="w-6 h-6 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border/50 backdrop-blur-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Animations</h3>
        
        {animations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No animations yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {animations.map((animation) => {
              const gradientClass = colorMap[animation.color as keyof typeof colorMap] || colorMap.blue;
              
              return (
                <div
                  key={animation.id}
                  className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors cursor-pointer border border-border/50"
                >
                  <div className={`w-12 h-8 bg-gradient-to-br ${gradientClass} rounded flex items-center justify-center shadow-sm`}>
                    <ShapeIcon shape={animation.shape} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">
                      {animation.color} {animation.shape} {animation.animationType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(animation.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
