"""
Manim renderer utilities for Prompt2Animate
"""
from manim import *
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, Any
import uuid

class AnimationRenderer:
    """Handles Manim animation rendering"""
    
    def __init__(self, output_dir: Path = None):
        self.output_dir = output_dir or Path("media")
        self.output_dir.mkdir(exist_ok=True)
    
    def create_scene_class(self, config: Dict[str, Any]) -> str:
        """Dynamically create Manim scene class based on config"""
        
        color_mapping = {
            "red": "RED",
            "blue": "BLUE",
            "green": "GREEN", 
            "purple": "PURPLE",
            "yellow": "YELLOW"
        }
        
        shape_mapping = {
            "circle": "Circle",
            "square": "Square", 
            "triangle": "Triangle"
        }
        
        animation_mapping = {
            "grow": "scale(2)",
            "rotate": "rotate(2*PI)",
            "fade": "set_opacity(0)",
            "move": "shift(RIGHT*3)",
            "pulse": "scale(1.5).scale(1)"
        }
        
        shape_class = shape_mapping.get(config["shape"], "Circle")
        color = color_mapping.get(config["color"], "BLUE")
        animation = animation_mapping.get(config["animation_type"], "scale(2)")
        duration = config.get("duration", 3)
        
        scene_code = f"""
from manim import *

class DynamicScene(Scene):
    def construct(self):
        shape = {shape_class}()
        shape.set_color({color})
        self.add(shape)
        
        if "{config['animation_type']}" == "pulse":
            self.play(shape.animate.scale(1.5), run_time={duration/2})
            self.play(shape.animate.scale(1), run_time={duration/2})
        elif "{config['animation_type']}" == "rotate":
            self.play(Rotate(shape, angle=2*PI), run_time={duration})
        elif "{config['animation_type']}" == "fade":
            self.play(FadeOut(shape), run_time={duration})
        elif "{config['animation_type']}" == "move":
            self.play(shape.animate.shift(RIGHT*3), run_time={duration})
        else:
            self.play(shape.animate.scale(2), run_time={duration})
"""
        return scene_code
    
    def render(self, config: Dict[str, Any], custom_code: str = None) -> str:
        """Render animation and return video path"""
        
        render_id = str(uuid.uuid4())
        
        # Use custom code or generate from config
        if custom_code:
            scene_code = custom_code
        else:
            scene_code = self.create_scene_class(config)
        
        # Create temporary Python file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(scene_code)
            script_path = f.name
        
        try:
            # Create output directory for this render
            render_output_dir = self.output_dir / render_id
            render_output_dir.mkdir(exist_ok=True)
            
            # Run Manim
            cmd = [
                "manim",
                script_path,
                "DynamicScene",
                "-pql",  # Preview quality, low resolution for speed
                "--media_dir", str(render_output_dir)
            ]
            
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"Manim failed: {result.stderr}")
            
            # Find the generated video
            video_files = list(render_output_dir.rglob("*.mp4"))
            if not video_files:
                raise RuntimeError("No video file was generated")
            
            return str(video_files[0])
            
        finally:
            # Clean up script file
            try:
                Path(script_path).unlink()
            except:
                pass

# Example usage
if __name__ == "__main__":
    renderer = AnimationRenderer()
    
    config = {
        "shape": "circle",
        "color": "blue", 
        "animation_type": "grow",
        "duration": 3
    }
    
    try:
        video_path = renderer.render(config)
        print(f"Animation rendered: {video_path}")
    except Exception as e:
        print(f"Render failed: {e}")
