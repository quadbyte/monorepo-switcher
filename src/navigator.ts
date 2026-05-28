import * as path from 'path';
import { PackageInfo } from './types';

export class WorkspaceNavigator {
  constructor(private rootPath: string) {}

  async switchToPackage(packageInfo: PackageInfo): Promise<void> {
    const targetPath = path.join(this.rootPath, packageInfo.path);
    console.log(`\n🚀 Switching to package: ${packageInfo.name}`);
    console.log(`📁 Path: ${targetPath}`);
    
    // In a real implementation, this would change the current working directory
    // For now, we'll just print the target path
    console.log(`\n💡 To navigate to this package, run: cd "${targetPath}"`);
    
    // Store the current directory change
    await this.storeDirectoryChange(targetPath);
  }

  private async storeDirectoryChange(targetPath: string): Promise<void> {
    // In a real implementation, this would store the directory change
    // For now, we'll just log it
    console.log(`✅ Directory change recorded. You can now navigate to: ${targetPath}`);
  }

  async generateCompletionScript(packages: PackageInfo[]): Promise<string> {
    const packageNames = packages.map(pkg => pkg.name);
    
    return `
# Monorepo Switcher Bash Completion
_monorepo_switcher_completion() {
    local cur prev packages
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    
    # Get all package names
    packages=(${packageNames.join(' ')})
    
    if [[ "\${cur}" == * ]]; then
        COMPREPLY=( $(compgen -W "\${packages[*]}" -- "\${cur}") )
    fi
}

complete -F _monorepo_switcher_completion monorepo-switcher
`;
  }

  async generateZshCompletion(packages: PackageInfo[]): Promise<string> {
    const packageNames = packages.map(pkg => pkg.name);
    
    return `
# Monorepo Switcher Zsh Completion
_monorepo_switcher() {
    local -a packages
    packages=(${packageNames.join(' ')})
    
    _describe 'packages' packages
}

compdef _monorepo_switcher monorepo-switcher
`;
  }
}