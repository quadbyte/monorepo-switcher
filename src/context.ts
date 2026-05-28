import * as fs from 'fs';
import * as path from 'path';
import { SwitchContext } from './types';

export class ContextManager {
  private readonly CONTEXT_FILE = '.monorepo-switcher-context.json';
  private readonly MAX_RECENT_PACKAGES = 10;

  constructor(private rootPath: string) {}

  async loadContext(): Promise<SwitchContext> {
    const contextPath = path.join(this.rootPath, this.CONTEXT_FILE);
    
    if (!fs.existsSync(contextPath)) {
      return {
        recentPackages: [],
        sessionStart: new Date(),
        lastActivity: new Date()
      };
    }

    try {
      const contextData = JSON.parse(fs.readFileSync(contextPath, 'utf-8'));
      return {
        ...contextData,
        sessionStart: new Date(contextData.sessionStart),
        lastActivity: new Date(contextData.lastActivity)
      };
    } catch (error) {
      // If context file is corrupted, return fresh context
      return {
        recentPackages: [],
        sessionStart: new Date(),
        lastActivity: new Date()
      };
    }
  }

  async saveContext(context: SwitchContext): Promise<void> {
    const contextPath = path.join(this.rootPath, this.CONTEXT_FILE);
    const contextData = {
      ...context,
      sessionStart: context.sessionStart.toISOString(),
      lastActivity: context.lastActivity.toISOString()
    };

    fs.writeFileSync(contextPath, JSON.stringify(contextData, null, 2));
  }

  async updateContext(packageName: string): Promise<void> {
    const context = await this.loadContext();
    
    // Remove if already exists to avoid duplicates
    context.recentPackages = context.recentPackages.filter(name => name !== packageName);
    
    // Add to beginning of list
    context.recentPackages.unshift(packageName);
    
    // Keep only the most recent packages
    if (context.recentPackages.length > this.MAX_RECENT_PACKAGES) {
      context.recentPackages = context.recentPackages.slice(0, this.MAX_RECENT_PACKAGES);
    }
    
    context.lastActivity = new Date();
    context.currentPackage = packageName;
    
    await this.saveContext(context);
  }

  async clearContext(): Promise<void> {
    const contextPath = path.join(this.rootPath, this.CONTEXT_FILE);
    if (fs.existsSync(contextPath)) {
      fs.unlinkSync(contextPath);
    }
  }
}