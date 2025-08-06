import { Download, Share, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnimationPreviewProps {
  videoUrl: string | null;
  isRendering: boolean;
  duration: number;
}

export default function AnimationPreview({ videoUrl, isRendering, duration }: AnimationPreviewProps) {
  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "animation.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (videoUrl && navigator.share) {
      try {
        await navigator.share({
          title: "My Animation",
          url: videoUrl,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    }
  };

  return (
    <Card className="glass-card border-border/50 backdrop-blur-lg">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 gradient-accent rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 shadow-lg shadow-pink-500/25">
            3
          </div>
          <h3 className="text-lg font-semibold">Preview Animation</h3>
        </div>

        {/* Video Player Container */}
        <div className="relative bg-background/50 rounded-xl overflow-hidden aspect-video border border-border/50">
          {/* Loading State */}
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-muted-foreground">Rendering animation...</p>
                <div className="w-48 mx-auto mt-3">
                  <Progress value={65} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Video Player */}
          {videoUrl && !isRendering && (
            <video 
              controls 
              className="w-full h-full object-contain bg-background/20"
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* Empty State */}
          {!videoUrl && !isRendering && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play className="text-4xl text-muted-foreground mb-3 mx-auto h-16 w-16" />
                <p className="text-muted-foreground">Click "Render Animation" to see your creation</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleDownload}
              disabled={!videoUrl}
              variant="outline"
              className="bg-background/50 border-border text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Download MP4
            </Button>
            <Button
              onClick={handleShare}
              disabled={!videoUrl}
              variant="outline"
              className="bg-background/50 border-border text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Duration: <span>{duration.toFixed(1)}s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
