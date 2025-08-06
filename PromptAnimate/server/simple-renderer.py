#!/usr/bin/env python3
"""
Simple animation renderer for Prompt2Animate
Creates placeholder videos for demonstration purposes
"""
import sys
import json
import os
import tempfile
import subprocess
from pathlib import Path

def create_placeholder_video(config, output_path):
    """Create a simple placeholder video using ffmpeg"""
    
    # Color mapping for ffmpeg
    color_map = {
        "red": "red",
        "blue": "blue", 
        "green": "green",
        "purple": "purple",
        "yellow": "yellow"
    }
    
    color = color_map.get(config.get("color", "blue"), "blue")
    duration = config.get("duration", 3)
    shape = config.get("shape", "circle")
    animation_type = config.get("animationType", "grow")
    
    # Create a simple colored video with ffmpeg
    cmd = [
        "ffmpeg",
        "-f", "lavfi",
        "-i", f"color={color}:size=640x480:duration={duration}",
        "-f", "lavfi", 
        "-i", f"color=black:size=640x480:duration={duration}",
        "-filter_complex", f"[0:v][1:v]blend=all_mode=screen",
        "-y",  # Overwrite output
        str(output_path)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return True
        else:
            print(f"FFmpeg error: {result.stderr}", file=sys.stderr)
            return False
    except subprocess.TimeoutExpired:
        print("Video generation timeout", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Video generation failed: {e}", file=sys.stderr)
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python simple-renderer.py <config_json>", file=sys.stderr)
        sys.exit(1)
    
    try:
        config = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"Invalid JSON config: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Create output directory
    output_dir = Path("media/videos")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    import uuid
    video_id = str(uuid.uuid4())
    output_path = output_dir / f"{video_id}.mp4"
    
    if create_placeholder_video(config, output_path):
        print(str(output_path))
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()