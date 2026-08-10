export interface PackageInfo {
  name: string;
  path: string;
  type: PackageType;
  dependencies: string[];
  scripts: string[];
  gitStatus: GitStatus;
  recentActivity: Date;
  description?: string;
}

export type PackageType = 
  | 'node'
  | 'react'
  | 'next'
  | 'react-native'
  | 'docs'
  | 'unknown';

export type GitStatus = 'clean' | 'modified' | 'untracked';

export interface PackageDiscoveryOptions {
  searchPaths?: string[];
  includeHidden?: boolean;
  maxDepth?: number;
}

export interface SwitchContext {
  currentPackage?: string;
  recentPackages: string[];
  sessionStart: Date;
  lastActivity: Date;
}

export interface SwitcherConfig {
  maxRecentPackages: number;
  historyFilePath: string;
}

export interface MonorepoConfig {
  rootPath: string;
  packagePatterns: string[];
  excludePatterns: string[];
  maxDepth: number;
}