import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Integration Tests', () => {
  const testDir = path.join(__dirname, 'fixtures', 'test-monorepo');
  const originalDir = process.cwd();

  beforeAll(async () => {
    // Create test directory structure
    await fs.mkdir(testDir, { recursive: true });
    
    // Create backend package
    await fs.mkdir(path.join(testDir, 'backend'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'backend', 'package.json'),
      JSON.stringify({
        name: 'backend',
        description: 'Backend API',
        dependencies: { express: '^4.18.0' },
        scripts: { start: 'node server.js' }
      })
    );

    // Create frontend package
    await fs.mkdir(path.join(testDir, 'frontend'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'frontend', 'package.json'),
      JSON.stringify({
        name: 'frontend',
        description: 'Frontend React app',
        dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
        scripts: { start: 'react-scripts start' }
      })
    );

    // Create shared package
    await fs.mkdir(path.join(testDir, 'shared'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'shared', 'package.json'),
      JSON.stringify({
        name: 'shared',
        description: 'Shared utilities',
        dependencies: { typescript: '^5.0.0' },
        scripts: { build: 'tsc' }
      })
    );

    // Build the CLI
    execSync('npm run build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
    process.chdir(originalDir);
  });

  it('should discover all packages in test monorepo', () => {
    process.chdir(testDir);
    
    const result = execSync(`node ${path.join(__dirname, '..', 'build', 'cli.js')}`, { encoding: 'utf8' });
    
    expect(result).toContain('backend');
    expect(result).toContain('frontend');
    expect(result).toContain('shared');
    expect(result).toContain('Backend API');
    expect(result).toContain('Frontend React app');
    expect(result).toContain('Shared utilities');
  });

  it('should switch to a specific package', () => {
    process.chdir(testDir);
    
    const result = execSync(`node ${path.join(__dirname, '..', 'build', 'cli.js')} switch backend`, { encoding: 'utf8' });
    
    expect(result).toContain('Switched to backend');
    expect(result).toContain(path.join(testDir, 'backend'));
  });

  it('should show error for non-existent package', () => {
    process.chdir(testDir);
    
    expect(() => {
      execSync(`node ${path.join(__dirname, '..', 'build', 'cli.js')} switch non-existent`, { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
    }).toThrow('Package \'non-existent\' not found');
  });
});