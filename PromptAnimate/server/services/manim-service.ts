import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export interface ManimConfig {
  shape: "circle" | "square" | "triangle";
  color: "red" | "blue" | "green" | "purple" | "yellow";
  animationType: "grow" | "rotate" | "fade" | "move" | "pulse";
  duration: number;
}

export function generateManimScript(config: ManimConfig): string {
  const { shape, color, animationType, duration } = config;
  
  const colorMap = {
    red: "RED",
    blue: "BLUE", 
    green: "GREEN",
    purple: "PURPLE",
    yellow: "YELLOW"
  };
  
  const shapeMap = {
    circle: "Circle()",
    square: "Square()",
    triangle: "Triangle()"
  };
  
  const manimColor = colorMap[color];
  const manimShape = shapeMap[shape];
  
  let animation = "";
  switch (animationType) {
    case "grow":
      animation = `self.play(shape.animate.scale(2), run_time=${duration})`;
      break;
    case "rotate":
      animation = `self.play(Rotate(shape, angle=2*PI), run_time=${duration})`;
      break;
    case "fade":
      animation = `self.play(FadeOut(shape), run_time=${duration})`;
      break;
    case "move":
      animation = `self.play(shape.animate.shift(RIGHT*3), run_time=${duration})`;
      break;
    case "pulse":
      animation = `self.play(shape.animate.scale(1.5), run_time=${duration/2})
        self.play(shape.animate.scale(1), run_time=${duration/2})`;
      break;
  }
  
  return `from manim import *

class AnimationScene(Scene):
    def construct(self):
        shape = ${manimShape}
        shape.set_color(${manimColor})
        self.add(shape)
        ${animation}`;
}

export async function renderAnimation(config: ManimConfig, customCode?: string): Promise<string> {
  const scriptId = randomUUID();
  
  try {
    // Use simple renderer for now (until Manim is properly installed)
    const result = await new Promise<string>((resolve, reject) => {
      const configJson = JSON.stringify(config);
      const pythonProcess = spawn("python3", [
        join(process.cwd(), "server", "simple-renderer.py"),
        configJson
      ]);
      
      let stdout = "";
      let stderr = "";
      
      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          const videoPath = stdout.trim();
          const relativePath = videoPath.replace(process.cwd() + "/", "");
          resolve(`/api/${relativePath}`);
        } else {
          reject(new Error(`Video render failed: ${stderr}`));
        }
      });
    });
    
    return result;
  } catch (error) {
    throw new Error(`Animation rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
