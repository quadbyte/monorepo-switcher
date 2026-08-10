import * as simpleGit from 'simple-git';
import * as path from 'path';
import { GitStatus } from './types';

export class GitStatusChecker {
  private git: simpleGit.SimpleGit;

  constructor(private rootPath: string) {
    this.git = simpleGit.default(rootPath);
  }

  async checkPackageStatus(packagePath: string): Promise<GitStatus> {
    try {
      const fullPackagePath = path.join(this.rootPath, packagePath);
      
      // Check if the directory is a git repository
      const isGitRepo = await this.git.checkIsRepo();
      if (!isGitRepo) {
        return 'clean';
      }

      // Check for uncommitted changes
      const status = await this.git.status([fullPackagePath]);
      
      if (status.not_added.length > 0 || status.modified.length > 0) {
        return 'modified';
      }

      return 'clean';
    } catch (error) {
      // If git operations fail, assume clean status
      return 'clean';
    }
  }

  async checkAllPackages(packagePaths: string[]): Promise<Map<string, GitStatus>> {
    const statusMap = new Map<string, GitStatus>();

    for (const pkgPath of packagePaths) {
      const status = await this.checkPackageStatus(pkgPath);
      statusMap.set(pkgPath, status);
    }

    return statusMap;
  }
}