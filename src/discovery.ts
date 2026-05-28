import * as fs from 'fs';
import * as path from 'path';
import fastGlob from 'fast-glob';
import { PackageInfo, PackageType, PackageDiscoveryOptions } from './types';

export class PackageDiscovery {
  private options: Required<PackageDiscoveryOptions>;

  constructor(options: PackageDiscoveryOptions = {}) {
    this.options = {
      searchPaths: ['packages', 'apps', 'libs', 'workspaces'],
      includeHidden: false,
      maxDepth: 3,
      ...options
    };
  }

  async discoverPackages(rootPath: string): Promise<PackageInfo[]> {
    const packagePaths = await this.findPackagePaths(rootPath);
    
    const packageInfos: PackageInfo[] = [];
    
    for (const pkgPath of packagePaths) {
      try {
        const packageInfo = await this.parsePackage(pkgPath, rootPath);
        packageInfos.push(packageInfo);
      } catch (error) {
        console.warn(`Failed to parse package at ${pkgPath}:`, error);
      }
    }

    return packageInfos;
  }

  private async findPackagePaths(rootPath: string): Promise<string[]> {
    const patterns = this.options.searchPaths.map(pattern => 
      path.join(rootPath, pattern, '**/package.json')
    );

    const packageFiles = await fastGlob(patterns, {
      ignore: this.options.includeHidden ? [] : ['**/node_modules/**', '**/.git/**'],
      deep: this.options.maxDepth,
      onlyFiles: true
    });

    return packageFiles.map(file => path.dirname(file));
  }

  private async parsePackage(packagePath: string, rootPath: string): Promise<PackageInfo> {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    return {
      name: packageJson.name,
      path: path.relative(rootPath, packagePath),
      type: this.detectPackageType(packageJson),
      dependencies: Object.keys(packageJson.dependencies || {}),
      scripts: Object.keys(packageJson.scripts || {}),
      gitStatus: 'clean', // Will be updated by git status checker
      recentActivity: new Date(fs.statSync(packagePath).mtime),
      description: packageJson.description
    };
  }

  private detectPackageType(packageJson: any): PackageType {
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    const allDeps = [...dependencies, ...devDependencies];

    // React detection
    if (allDeps.includes('react') || allDeps.includes('react-dom')) {
      if (allDeps.includes('next')) return 'next';
      if (allDeps.includes('react-native')) return 'react-native';
      return 'react';
    }

    // Node.js detection
    if (allDeps.some(dep => dep.startsWith('express') || dep.startsWith('koa') || dep.startsWith('hapi'))) {
      return 'node';
    }

    // Documentation detection
    if (allDeps.includes('docsify') || allDeps.includes('docusaurus') || allDeps.includes('vuepress')) {
      return 'docs';
    }

    // Fallback based on directory structure
    const dirName = path.basename(packageJson.name || '');
    if (dirName.includes('doc') || dirName.includes('docs')) {
      return 'docs';
    }

    return 'unknown';
  }
}