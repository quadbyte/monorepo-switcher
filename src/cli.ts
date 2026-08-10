import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { Command } from 'commander';
import { PackageInfo, GitStatus } from './types';
import { PackageDiscovery } from './discovery';
import { GitStatusChecker } from './git-status';
import { ContextManager } from './context';
import { WorkspaceNavigator } from './navigator';

const program = new Command();

program
  .name('monorepo-switcher')
  .description('Intelligent CLI for fast monorepo workspace switching')
  .version('1.0.0');

program
  .command('list')
  .alias('ls')
  .description('List all packages in the monorepo')
  .option('--recent', 'Show recently used packages first')
  .option('--dirty', 'Show only packages with uncommitted changes')
  .option('--type <type>', 'Filter packages by type (node, react, next, react-native, docs)')
  .action(async (options) => {
    await listPackages(options);
  });

program
  .command('switch <package>')
  .alias('s')
  .description('Switch to a specific package')
  .action(async (packageName) => {
    await switchToPackage(packageName);
  });

program
  .command('recent')
  .description('Show recently used packages')
  .action(async () => {
    await showRecentPackages();
  });

program
  .command('completion')
  .description('Generate shell completion script')
  .option('--shell <shell>', 'Shell type (bash|zsh)', 'bash')
  .action(async (options) => {
    await generateCompletion(options.shell);
  });

async function listPackages(options: any) {
  const rootPath = process.cwd();
  const spinner = ora('Discovering packages...').start();
  
  try {
    const discovery = new PackageDiscovery();
    const packages = await discovery.discoverPackages(rootPath);
    
    // Check git status for all packages
    const gitChecker = new GitStatusChecker(rootPath);
    const gitStatuses = await gitChecker.checkAllPackages(packages.map(p => p.path));
    
    // Update packages with git status
    const packagesWithStatus = packages.map(pkg => ({
      ...pkg,
      gitStatus: gitStatuses.get(pkg.path) || 'clean'
    }));

    spinner.succeed('Discovered packages');

    // Filter packages based on options
    let filteredPackages = packagesWithStatus;
    
    if (options.dirty) {
      filteredPackages = filteredPackages.filter(pkg => pkg.gitStatus !== 'clean');
    }
    
    if (options.type) {
      filteredPackages = filteredPackages.filter(pkg => pkg.type === options.type);
    }

    // Sort packages
    if (options.recent) {
      const context = await new ContextManager(rootPath).loadContext();
      filteredPackages.sort((a, b) => {
        const aIndex = context.recentPackages.indexOf(a.name);
        const bIndex = context.recentPackages.indexOf(b.name);
        return aIndex - bIndex;
      });
    } else {
      filteredPackages.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayPackages(filteredPackages);
  } catch (error) {
    spinner.fail('Failed to discover packages');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}

function displayPackages(packages: PackageInfo[]) {
  if (packages.length === 0) {
    console.log(chalk.yellow('No packages found'));
    return;
  }

  const table = new Table({
    head: [chalk.cyan('Package'), chalk.cyan('Type'), chalk.cyan('Status'), chalk.cyan('Path')],
    colWidths: [25, 12, 10, 40]
  });

  packages.forEach(pkg => {
    const statusIcon = getStatusIcon(pkg.gitStatus);
    const typeIcon = getTypeIcon(pkg.type);
    
    table.push([
      `${pkg.name}`,
      `${typeIcon} ${pkg.type}`,
      `${statusIcon} ${pkg.gitStatus}`,
      pkg.path
    ]);
  });

  console.log(table.toString());
}

function getStatusIcon(status: GitStatus): string {
  switch (status) {
    case 'clean':
      return chalk.green('✅');
    case 'modified':
      return chalk.yellow('⚠️');
    case 'untracked':
      return chalk.red('🔴');
    default:
      return '❓';
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'node':
      return '🟢';
    case 'react':
      return '⚛️';
    case 'next':
      return '🚀';
    case 'react-native':
      return '📱';
    case 'docs':
      return '📚';
    default:
      return '📦';
  }
}

async function switchToPackage(packageName: string) {
  const rootPath = process.cwd();
  const spinner = ora(`Switching to ${packageName}...`).start();
  
  try {
    const discovery = new PackageDiscovery();
    const packages = await discovery.discoverPackages(rootPath);
    
    const targetPackage = packages.find(pkg => pkg.name === packageName);
    
    if (!targetPackage) {
      spinner.fail(`Package "${packageName}" not found`);
      console.log(chalk.yellow('Available packages:'));
      packages.forEach(pkg => console.log(`  - ${pkg.name}`));
      process.exit(1);
    }

    const navigator = new WorkspaceNavigator(rootPath);
    await navigator.switchToPackage(targetPackage);
    
    // Update context
    const context = new ContextManager(rootPath);
    await context.updateContext(packageName);
    
    spinner.succeed(`Switched to ${packageName}`);
  } catch (error) {
    spinner.fail('Failed to switch package');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}

async function showRecentPackages() {
  const rootPath = process.cwd();
  const context = await new ContextManager(rootPath).loadContext();
  
  if (context.recentPackages.length === 0) {
    console.log(chalk.yellow('No recent packages found'));
    return;
  }

  console.log(chalk.cyan('Recently used packages:'));
  context.recentPackages.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg}`);
  });
}

async function generateCompletion(shell: string) {
  const rootPath = process.cwd();
  const discovery = new PackageDiscovery();
  const packages = await discovery.discoverPackages(rootPath);
  
  const navigator = new WorkspaceNavigator(rootPath);
  
  if (shell === 'bash') {
    const completion = await navigator.generateCompletionScript(packages);
    console.log(completion);
  } else if (shell === 'zsh') {
    const completion = await navigator.generateZshCompletion(packages);
    console.log(completion);
  } else {
    console.error(chalk.red(`Unsupported shell: ${shell}`));
    process.exit(1);
  }
}

program.parse();