import * as chalk from 'chalk';
import Table from 'cli-table3';
import { PackageInfo } from './discovery';

export class Formatter {
  table(packages: PackageInfo[], recentOnly = false): string {
    const table = new Table({
      head: [
        chalk.cyan('Package'),
        chalk.cyan('Type'),
        chalk.cyan('Status'),
        chalk.cyan('Scripts'),
        chalk.cyan('Description')
      ],
      colWidths: [25, 12, 10, 15, 40]
    });

    const displayPackages = recentOnly 
      ? packages.slice(0, 5) 
      : packages.sort((a, b) => b.recentActivity.getTime() - a.recentActivity.getTime());

    displayPackages.forEach(pkg => {
      table.push([
        this.formatPackageName(pkg),
        this.formatType(pkg.type),
        this.formatStatus(pkg.gitStatus),
        this.formatScripts(pkg.scripts),
        pkg.description || ''
      ]);
    });

    return table.toString();
  }

  private formatPackageName(pkg: PackageInfo): string {
    const name = pkg.name;
    const path = pkg.path;
    
    // If name is the same as path, just show name
    if (name === path) {
      return chalk.bold(name);
    }
    
    // Show both name and path
    return `${chalk.bold(name)}\n${chalk.gray(path)}`;
  }

  private formatType(type: PackageInfo['type']): string {
    const typeColors = {
      'node': chalk.blue,
      'react': chalk.green,
      'next': chalk.purple,
      'react-native': chalk.yellow,
      'docs': chalk.cyan,
      'unknown': chalk.gray
    };

    const typeLabels = {
      'node': 'Node.js',
      'react': 'React',
      'next': 'Next.js',
      'react-native': 'React Native',
      'docs': 'Docs',
      'unknown': 'Unknown'
    };

    return typeColors[type](typeLabels[type]);
  }

  private formatStatus(status: PackageInfo['gitStatus']): string {
    const statusSymbols = {
      'clean': '✅',
      'modified': '⚠️',
      'untracked': '❌'
    };

    const statusColors = {
      'clean': chalk.green,
      'modified': chalk.yellow,
      'untracked': chalk.red
    };

    return statusColors[status](statusSymbols[status]);
  }

  private formatScripts(scripts: string[]): string {
    if (scripts.length === 0) return '';
    
    // Only show the first 3 scripts to avoid clutter
    const displayScripts = scripts.slice(0, 3);
    return displayScripts.join(', ');
  }

  header(monorepoPath: string, packageCount: number): string {
    const title = '📦 Monorepo';
    const pathInfo = chalk.bold(monorepoPath);
    const count = chalk.cyan(`${packageCount} packages`);
    
    return `${title}: ${pathInfo} (${count})\n`;
  }

  recentSectionTitle(): string {
    return chalk.yellow('🎯 RECENTLY USED:');
  }

  allPackagesSectionTitle(): string {
    return chalk.blue('🔍 ALL PACKAGES:');
  }

  switchConfirmation(packageName: string, packagePath: string): string {
    const switchMsg = `🎯 Switching to ${packageName}...`;
    const successMsg = `✅ Successfully switched to ${packagePath}`;
    
    return `${switchMsg}\n${successMsg}`;
  }

  packageNotFound(packageName: string): string {
    return chalk.red(`❌ Package '${packageName}' not found`);
  }

  helpText(): string {
    return `
${chalk.bold.cyan('monorepo-switcher')} - Intelligent CLI for fast monorepo workspace switching

${chalk.bold('Usage:')}
  monorepo-switcher                    # List all packages
  monorepo-switcher <package>         # Switch to specific package
  monorepo-switcher --fuzzy            # Fuzzy search for packages
  monorepo-switcher --recent           # Show recently used packages
  monorepo-switcher --help             # Show help
  monorepo-switcher --version          # Show version

${chalk.bold('Examples:')}
  monorepo-switcher                    # List all packages in current monorepo
  monorepo-switcher backend            # Switch to backend package
  monorepo-switcher --fuzzy            # Interactive fuzzy search
  monorepo-switcher --recent           # Show recently used packages

${chalk.bold('Status Icons:')}
  ✅ clean      - No changes
  ⚠️ modified   - Has changes
  ❌ untracked   - Untracked files
`;
  }
}