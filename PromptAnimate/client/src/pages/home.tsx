import { useState } from "react";
import { Play, Sparkles, Wand2, Github, BookOpen, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import PromptInput from "@/components/prompt-input";
import ParameterEditor from "@/components/parameter-editor";
import AnimationPreview from "@/components/animation-preview";
import RecentAnimations from "@/components/recent-animations";

export default function Home() {
  const [parameters, setParameters] = useState({
    shape: "circle" as const,
    color: "blue" as const,
    animationType: "grow" as const,
    duration: 3,
    manimCode: "",
  });

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Wand2 className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Prompt2Animate
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <a href="#examples" className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1">
                  <Palette className="w-4 h-4" />
                  <span>Examples</span>
                </a>
                <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Docs</span>
                </a>
                <a href="#github" className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-400">AI-Powered Animation Generation</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Create{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Stunning Animations
            </span>
            <br />
            with Simple Words
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into beautiful 2D animations using natural language. 
            No coding required - just describe what you want to see and watch it come to life.
          </p>
        </div>

        {/* Main Workflow */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Input & Controls */}
          <div className="space-y-6">
            <PromptInput 
              onParametersGenerated={setParameters}
            />
            
            <ParameterEditor 
              parameters={parameters}
              onParametersChange={setParameters}
              onRender={setIsRendering}
              onVideoGenerated={setVideoUrl}
            />
          </div>

          {/* Right Column - Preview & Output */}
          <div className="space-y-6">
            <AnimationPreview 
              videoUrl={videoUrl}
              isRendering={isRendering}
              duration={parameters.duration}
            />
            
            <RecentAnimations />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16" id="examples">
          <div className="glass-card rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all">
              <Sparkles className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Natural Language</h3>
            <p className="text-muted-foreground leading-relaxed">
              Describe animations in plain English. No coding experience needed - just tell us what you want to see.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all">
              <Palette className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Full Customization</h3>
            <p className="text-muted-foreground leading-relaxed">
              Fine-tune every aspect with visual controls. Adjust colors, shapes, timing, and advanced parameters.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center group hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all">
              <Play className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Preview</h3>
            <p className="text-muted-foreground leading-relaxed">
              Watch your creations come to life instantly. High-quality video output ready for download and sharing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-lg mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
                <Wand2 className="text-white text-sm" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Prompt2Animate
              </span>
            </div>
            <p className="text-muted-foreground mb-4">
              Transform your imagination into stunning animations with the power of AI and natural language.
            </p>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Prompt2Animate. Powered by Manim Community Edition and modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
