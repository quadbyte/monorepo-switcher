#!/usr/bin/env node

import { Command } from 'commander';
import { PackageDiscovery } from './discovery';
import { Formatter } from './formatter';
import { WorkspaceNavigator } from './navigator';
import * as chalk from 'chalk';

const program = new Command();

program
  .name('monorepo-switcher')
  .description('Intelligent CLI for fast monorepo workspace switching')
  .version('1.0.0');

// List command
program
  .command('list')
  .alias('ls')
  .description('List all packages with context')
  .option('--recent', 'Show only recently used packages')
  .action(async (options) => {
    try {
      const discovery = new PackageDiscovery();
      const navigator = new WorkspaceNavigator();
      const formatter = new Formatter();
      
      // Load history
      await navigator.loadHistory();
      
      const packages = await discovery.discover();
      const recentPackages = await navigator.getRecentPackages();
      
      // Display header
      const monorepoPath = process.cwd();
      console.log(formatter.header(monorepoPath, packages.length));
      console.log();
      
      // Display recent packages section
      if (recentPackages.length > 0) {
        console.log(formatter.recentSectionTitle());
        const recentPackagesInfo = packages.filter(p => recentPackages.includes(p.name));
        if (recentPackagesInfo.length > 0) {
          console.log(formatter.table(recentPackagesInfo, true));
          console.log();
        }
      }
      
      // Display all packages section
      if (!options.recent) {
        console.log(formatter.allPackagesSectionTitle());
        console.log(formatter.table(packages));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Switch command
program
  .command('switch <package>')
  .description('Switch to specific package')
  .action(async (packageName) => {
    try {
      const navigator = new WorkspaceNavigator();
      const formatter = new Formatter();
      
      // Load history
      await navigator.loadHistory();
      
      console.log(formatter.switchConfirmation(packageName, ''));
      await navigator.switch(packageName);
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Fuzzy search command
program
  .command('fuzzy')
  .alias('f')
  .description('Fuzzy search for packages')
  .action(async () => {
    try {
      const discovery = new PackageDiscovery();
      const packages = await discovery.discover();
      
      // Simple fuzzy search implementation
      // In a real implementation, you'd use a proper fuzzy search library
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Search for package: ', (searchTerm: string) => {
        rl.close();
        
        const filtered = packages.filter(pkg => 
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        if (filtered.length === 0) {
          console.log(chalk.yellow('No packages found matching your search'));
          return;
        }
        
        const formatter = new Formatter();
        console.log(formatter.table(filtered));
      });
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Recent command
program
  .command('recent')
  .alias('r')
  .description('Show recently used packages')
  .action(async () => {
    try {
      const navigator = new WorkspaceNavigator();
      const formatter = new Formatter();
      
      // Load history
      await navigator.loadHistory();
      
      const recentPackages = await navigator.getRecentPackages();
      
      if (recentPackages.length === 0) {
        console.log(chalk.yellow('No recent packages found'));
        return;
      }
      
      const discovery = new PackageDiscovery();
      const allPackages = await discovery.discover();
      const recentPackagesInfo = allPackages.filter(p => recentPackages.includes(p.name));
      
      const monorepoPath = process.cwd();
      console.log(formatter.header(monorepoPath, recentPackagesInfo.length));
      console.log(formatter.table(recentPackagesInfo, true));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .alias('h')
  .description('Show help')
  .action(() => {
    const formatter = new Formatter();
    console.log(formatter.helpText());
  });

// Version command
program
  .command('version')
  .alias('v')
  .description('Show version')
  .action(() => {
    console.log('monorepo-switcher version 1.0.0');
  });

// Default action (when no command is provided)
program.action(() => {
  program.parse(['node', 'monorepo-switcher', 'list']);
});

// Parse and execute
program.parse();