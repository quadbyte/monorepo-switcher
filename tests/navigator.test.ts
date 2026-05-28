import { WorkspaceNavigator } from '../src/navigator';
import { PackageInfo } from '../src/types';

describe('WorkspaceNavigator', () => {
  let navigator: WorkspaceNavigator;
  let mockRootPath: string;

  beforeEach(() => {
    mockRootPath = '/test/monorepo';
    navigator = new WorkspaceNavigator(mockRootPath);
  });

  describe('switchToPackage', () => {
    it('should log package switch information', async () => {
      const mockPackage: PackageInfo = {
        name: 'backend',
        path: 'packages/backend',
        type: 'node',
        dependencies: ['express'],
        scripts: ['start', 'test'],
        gitStatus: 'clean',
        recentActivity: new Date(),
        description: 'Backend API service'
      };

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await navigator.switchToPackage(mockPackage);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Switching to package: backend')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Path: /test/monorepo/packages/backend')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('generateCompletionScript', () => {
    it('should generate bash completion script', async () => {
      const mockPackages: PackageInfo[] = [
        {
          name: 'backend',
          path: 'packages/backend',
          type: 'node',
          dependencies: ['express'],
          scripts: ['start'],
          gitStatus: 'clean',
          recentActivity: new Date()
        },
        {
          name: 'frontend',
          path: 'packages/frontend',
          type: 'react',
          dependencies: ['react'],
          scripts: ['start'],
          gitStatus: 'clean',
          recentActivity: new Date()
        }
      ];

      const completion = await navigator.generateCompletionScript(mockPackages);
      
      expect(completion).toContain('# Monorepo Switcher Bash Completion');
      expect(completion).toContain('backend frontend');
    });

    it('should generate zsh completion script', async () => {
      const mockPackages: PackageInfo[] = [
        {
          name: 'backend',
          path: 'packages/backend',
          type: 'node',
          dependencies: ['express'],
          scripts: ['start'],
          gitStatus: 'clean',
          recentActivity: new Date()
        }
      ];

      const completion = await navigator.generateZshCompletion(mockPackages);
      
      expect(completion).toContain('# Monorepo Switcher Zsh Completion');
      expect(completion).toContain('backend');
    });
  });
});