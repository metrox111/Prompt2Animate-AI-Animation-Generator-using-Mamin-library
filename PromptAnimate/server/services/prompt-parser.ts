export interface ParsedPrompt {
  shape: "circle" | "square" | "triangle";
  color: "red" | "blue" | "green" | "purple" | "yellow";
  animationType: "grow" | "rotate" | "fade" | "move" | "pulse";
  duration: number;
}

export function parsePrompt(prompt: string): ParsedPrompt {
  const lowerPrompt = prompt.toLowerCase();
  
  // Parse shape
  let shape: ParsedPrompt["shape"] = "circle";
  if (lowerPrompt.includes("square") || lowerPrompt.includes("rectangle")) {
    shape = "square";
  } else if (lowerPrompt.includes("triangle")) {
    shape = "triangle";
  }
  
  // Parse color
  let color: ParsedPrompt["color"] = "blue";
  if (lowerPrompt.includes("red")) {
    color = "red";
  } else if (lowerPrompt.includes("green")) {
    color = "green";
  } else if (lowerPrompt.includes("purple") || lowerPrompt.includes("violet")) {
    color = "purple";
  } else if (lowerPrompt.includes("yellow")) {
    color = "yellow";
  }
  
  // Parse animation type
  let animationType: ParsedPrompt["animationType"] = "grow";
  if (lowerPrompt.includes("rotate") || lowerPrompt.includes("spin") || lowerPrompt.includes("turn")) {
    animationType = "rotate";
  } else if (lowerPrompt.includes("fade") || lowerPrompt.includes("disappear")) {
    animationType = "fade";
  } else if (lowerPrompt.includes("move") || lowerPrompt.includes("slide") || lowerPrompt.includes("shift")) {
    animationType = "move";
  } else if (lowerPrompt.includes("pulse") || lowerPrompt.includes("beat")) {
    animationType = "pulse";
  }
  
  // Parse duration
  let duration = 3;
  const durationMatch = lowerPrompt.match(/(\d+)\s*(?:second|sec|s)/);
  if (durationMatch) {
    const parsed = parseInt(durationMatch[1]);
    if (parsed >= 1 && parsed <= 10) {
      duration = parsed;
    }
  }
  
  return { shape, color, animationType, duration };
}
