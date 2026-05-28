import * as fs from 'fs/promises';
import * as path from 'path';
import fastGlob from 'fast-glob';
import { simpleGit } from 'simple-git';

export interface PackageInfo {
  name: string;
  path: string;
  type: 'node' | 'react' | 'next' | 'react-native' | 'docs' | 'unknown';
  dependencies: string[];
  scripts: string[];
  gitStatus: 'clean' | 'modified' | 'untracked';
  recentActivity: Date;
  description?: string;
}

export class PackageDiscovery {
  private readonly git = simpleGit();

  async discover(): Promise<PackageInfo[]> {
    const packageFiles = await this.findPackageFiles();
    const packages = await Promise.all(
      packageFiles.map(file => this.parsePackage(file))
    );
    return packages.filter((pkg): pkg is PackageInfo => pkg !== null);
  }

  private async findPackageFiles(): Promise<string[]> {
    return fastGlob('**/package.json', {
      ignore: ['**/node_modules/**'],
      cwd: process.cwd()
    });
  }

  private async parsePackage(filePath: string): Promise<PackageInfo | null> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const pkg = JSON.parse(content);
      const relativePath = path.dirname(filePath);
      
      return {
        name: pkg.name || relativePath,
        path: relativePath,
        type: this.detectPackageType(pkg),
        dependencies: Object.keys(pkg.dependencies || {}),
        scripts: Object.keys(pkg.scripts || {}),
        gitStatus: await this.checkGitStatus(relativePath),
        recentActivity: await this.getLastModified(relativePath),
        description: pkg.description
      };
    } catch (error) {
      console.warn(`Warning: Failed to parse package.json at ${filePath}:`, error);
      return null;
    }
  }

  private detectPackageType(pkg: any): PackageInfo['type'] {
    const deps = Object.keys(pkg.dependencies || {});
    
    if (deps.includes('next')) return 'next';
    if (deps.includes('react-native')) return 'react-native';
    if (deps.includes('react')) return 'react';
    if (pkg.name?.includes('docs') || pkg.name?.includes('documentation')) return 'docs';
    if (deps.some(d => d.startsWith('@types/') || d === 'typescript')) return 'node';
    return 'unknown';
  }

  private async checkGitStatus(packagePath: string): Promise<PackageInfo['gitStatus']> {
    try {
      const status = await this.git.status([packagePath]);
      const files = status.files;
      
      if (files.length === 0) return 'clean';
      
      // Check if any files are untracked
      const hasUntracked = files.some(f => f.index === '?' && f.working_dir === '?');
      if (hasUntracked) return 'untracked';
      
      return 'modified';
    } catch (error) {
      // If git operations fail, assume clean status
      return 'clean';
    }
  }

  private async getLastModified(packagePath: string): Promise<Date> {
    try {
      const stats = await fs.stat(packagePath);
      return stats.mtime;
    } catch (error) {
      return new Date();
    }
  }
}