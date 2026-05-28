import * as path from 'path';
import { PackageDiscovery } from './discovery';

export class WorkspaceNavigator {
  private history: string[] = [];
  private readonly maxHistory = 10;
  private readonly historyFile = '.monorepo-switcher-history';

  async switch(packageName: string): Promise<void> {
    const packagePath = await this.findPackagePath(packageName);
    if (!packagePath) {
      throw new Error(`Package '${packageName}' not found`);
    }

    // Update history
    this.updateHistory(packageName);
    
    // Change directory
    process.chdir(packagePath);
    console.log(`🎯 Switched to ${packageName} at ${packagePath}`);
  }

  async findPackagePath(packageName: string): Promise<string | null> {
    const discovery = new PackageDiscovery();
    const packages = await discovery.discover();
    
    // Exact match by name
    const exactMatch = packages.find(p => p.name === packageName);
    if (exactMatch) {
      return path.resolve(process.cwd(), exactMatch.path);
    }
    
    // Partial match by path
    const pathMatch = packages.find(p => 
      p.path.includes(packageName) || 
      p.name.includes(packageName)
    );
    
    if (pathMatch) {
      return path.resolve(process.cwd(), pathMatch.path);
    }
    
    return null;
  }

  private updateHistory(packageName: string): void {
    this.history = this.history.filter(name => name !== packageName);
    this.history.unshift(packageName);
    
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
    
    this.saveHistory();
  }

  async getRecentPackages(): Promise<string[]> {
    return this.history;
  }

  private async saveHistory(): Promise<void> {
    try {
      const historyPath = path.join(process.cwd(), this.historyFile);
      const historyContent = this.history.join('\n');
      await require('fs').promises.writeFile(historyPath, historyContent);
    } catch (error) {
      // Silently fail if we can't save history
    }
  }

  async loadHistory(): Promise<void> {
    try {
      const historyPath = path.join(process.cwd(), this.historyFile);
      const historyContent = await require('fs').promises.readFile(historyPath, 'utf8');
      this.history = historyContent.split('\n').filter(Boolean).slice(0, this.maxHistory);
    } catch (error) {
      // Silently fail if history doesn't exist
    }
  }
}