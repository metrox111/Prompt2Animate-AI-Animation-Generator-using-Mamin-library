import { animations, type Animation, type InsertAnimation } from "@shared/schema";

export interface IStorage {
  getAnimation(id: number): Promise<Animation | undefined>;
  createAnimation(animation: InsertAnimation): Promise<Animation>;
  updateAnimation(id: number, updates: Partial<Animation>): Promise<Animation | undefined>;
  getRecentAnimations(limit?: number): Promise<Animation[]>;
}

export class MemStorage implements IStorage {
  private animations: Map<number, Animation>;
  private currentId: number;

  constructor() {
    this.animations = new Map();
    this.currentId = 1;
  }

  async getAnimation(id: number): Promise<Animation | undefined> {
    return this.animations.get(id);
  }

  async createAnimation(insertAnimation: InsertAnimation): Promise<Animation> {
    const id = this.currentId++;
    const animation: Animation = {
      ...insertAnimation,
      id,
      manimCode: insertAnimation.manimCode || null,
      videoUrl: null,
      createdAt: new Date(),
    };
    this.animations.set(id, animation);
    return animation;
  }

  async updateAnimation(id: number, updates: Partial<Animation>): Promise<Animation | undefined> {
    const existing = this.animations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.animations.set(id, updated);
    return updated;
  }

  async getRecentAnimations(limit = 10): Promise<Animation[]> {
    return Array.from(this.animations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
