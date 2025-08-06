import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { parsePrompt } from "./services/prompt-parser";
import { renderAnimation, generateManimScript } from "./services/manim-service";
import { promptParseSchema, renderAnimationSchema } from "@shared/schema";
import { join } from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Parse prompt endpoint
  app.post("/api/parse-prompt", async (req, res) => {
    try {
      const { prompt } = promptParseSchema.parse(req.body);
      const parsed = parsePrompt(prompt);
      const manimCode = generateManimScript(parsed);
      
      res.json({
        ...parsed,
        manimCode
      });
    } catch (error) {
      console.error("Parse prompt error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid prompt" 
      });
    }
  });

  // Render animation endpoint
  app.post("/api/render", async (req, res) => {
    try {
      const config = renderAnimationSchema.parse(req.body);
      
      // Create animation record
      const animation = await storage.createAnimation({
        prompt: `${config.color} ${config.shape} ${config.animationType}`,
        shape: config.shape,
        color: config.color,
        animationType: config.animationType,
        duration: config.duration,
        manimCode: config.manimCode || generateManimScript(config),
      });
      
      // Render animation
      const videoUrl = await renderAnimation(config, config.manimCode);
      
      // Update animation with video URL
      const updatedAnimation = await storage.updateAnimation(animation.id, {
        videoUrl
      });
      
      res.json({
        success: true,
        animation: updatedAnimation,
        videoUrl
      });
    } catch (error) {
      console.error("Render animation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Rendering failed" 
      });
    }
  });

  // Get recent animations
  app.get("/api/animations/recent", async (req, res) => {
    try {
      const animations = await storage.getRecentAnimations(5);
      res.json(animations);
    } catch (error) {
      console.error("Get recent animations error:", error);
      res.status(500).json({ 
        message: "Failed to fetch recent animations" 
      });
    }
  });

  // Serve video files  
  app.use("/api/media", express.static(join(process.cwd(), "media")));

  const httpServer = createServer(app);
  return httpServer;
}
