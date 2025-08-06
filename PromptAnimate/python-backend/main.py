from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import subprocess
import os
import tempfile
import uuid
from pathlib import Path
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnimationConfig(BaseModel):
    shape: str
    color: str
    animation_type: str
    duration: int
    manim_code: Optional[str] = None

class PromptRequest(BaseModel):
    prompt: str

# Create media directory if it doesn't exist
media_dir = Path("media")
media_dir.mkdir(exist_ok=True)

# Serve static video files
app.mount("/static", StaticFiles(directory="media"), name="static")

def generate_manim_script(config: AnimationConfig) -> str:
    """Generate Manim script from configuration"""
    color_map = {
        "red": "RED",
        "blue": "BLUE", 
        "green": "GREEN",
        "purple": "PURPLE",
        "yellow": "YELLOW"
    }
    
    shape_map = {
        "circle": "Circle()",
        "square": "Square()",
        "triangle": "Triangle()"
    }
    
    manim_color = color_map.get(config.color, "BLUE")
    manim_shape = shape_map.get(config.shape, "Circle()")
    
    animation_code = ""
    if config.animation_type == "grow":
        animation_code = f"self.play(shape.animate.scale(2), run_time={config.duration})"
    elif config.animation_type == "rotate":
        animation_code = f"self.play(Rotate(shape, angle=2*PI), run_time={config.duration})"
    elif config.animation_type == "fade":
        animation_code = f"self.play(FadeOut(shape), run_time={config.duration})"
    elif config.animation_type == "move":
        animation_code = f"self.play(shape.animate.shift(RIGHT*3), run_time={config.duration})"
    elif config.animation_type == "pulse":
        animation_code = f"""self.play(shape.animate.scale(1.5), run_time={config.duration/2})
        self.play(shape.animate.scale(1), run_time={config.duration/2})"""
    
    return f"""from manim import *

class AnimationScene(Scene):
    def construct(self):
        shape = {manim_shape}
        shape.set_color({manim_color})
        self.add(shape)
        {animation_code}"""

def parse_prompt(prompt: str) -> dict:
    """Parse natural language prompt into animation parameters"""
    prompt_lower = prompt.lower()
    
    # Parse shape
    shape = "circle"
    if "square" in prompt_lower or "rectangle" in prompt_lower:
        shape = "square"
    elif "triangle" in prompt_lower:
        shape = "triangle"
    
    # Parse color
    color = "blue"
    if "red" in prompt_lower:
        color = "red"
    elif "green" in prompt_lower:
        color = "green"
    elif "purple" in prompt_lower or "violet" in prompt_lower:
        color = "purple"
    elif "yellow" in prompt_lower:
        color = "yellow"
    
    # Parse animation type
    animation_type = "grow"
    if "rotate" in prompt_lower or "spin" in prompt_lower or "turn" in prompt_lower:
        animation_type = "rotate"
    elif "fade" in prompt_lower or "disappear" in prompt_lower:
        animation_type = "fade"
    elif "move" in prompt_lower or "slide" in prompt_lower or "shift" in prompt_lower:
        animation_type = "move"
    elif "pulse" in prompt_lower or "beat" in prompt_lower:
        animation_type = "pulse"
    
    # Parse duration
    duration = 3
    import re
    duration_match = re.search(r'(\d+)\s*(?:second|sec|s)', prompt_lower)
    if duration_match:
        parsed_duration = int(duration_match.group(1))
        if 1 <= parsed_duration <= 10:
            duration = parsed_duration
    
    return {
        "shape": shape,
        "color": color,
        "animation_type": animation_type,
        "duration": duration
    }

@app.post("/parse-prompt")
async def parse_prompt_endpoint(request: PromptRequest):
    """Parse natural language prompt into parameters"""
    try:
        parsed = parse_prompt(request.prompt)
        config = AnimationConfig(**parsed)
        manim_code = generate_manim_script(config)
        
        return {
            **parsed,
            "manimCode": manim_code
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/render")
async def render_animation(config: AnimationConfig):
    """Render animation using Manim"""
    try:
        # Generate unique ID for this render
        render_id = str(uuid.uuid4())
        
        # Use custom code if provided, otherwise generate from config
        script_content = config.manim_code if config.manim_code else generate_manim_script(config)
        
        # Create temporary script file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(script_content)
            script_path = f.name
        
        try:
            # Create output directory
            output_dir = media_dir / render_id
            output_dir.mkdir(exist_ok=True)
            
            # Run Manim command
            cmd = [
                "python", "-m", "manim",
                script_path,
                "AnimationScene",
                "-pql",  # Preview quality, low resolution
                "--media_dir", str(output_dir)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Manim render failed: {result.stderr}")
            
            # Find the generated video file
            video_files = list(output_dir.rglob("*.mp4"))
            if not video_files:
                raise HTTPException(status_code=500, detail="No video file generated")
            
            video_path = video_files[0]
            video_url = f"/static/{video_path.relative_to(media_dir)}"
            
            return {
                "success": True,
                "video_url": video_url,
                "render_id": render_id
            }
            
        finally:
            # Clean up temporary script file
            try:
                os.unlink(script_path)
            except:
                pass
                
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Render timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
