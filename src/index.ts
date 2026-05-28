#!/usr/bin/env node

// Entry point for the monorepo-switcher CLI
// This file just re-exports the CLI module for easier importing

export * from './cli';
export * from './types';
export * from './discovery';
export * from './git-status';
export * from './context';
export * from './navigator';