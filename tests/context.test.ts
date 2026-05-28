import { ContextManager } from '../src/context';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockRootPath: string;

  beforeEach(() => {
    mockRootPath = '/test/monorepo';
    contextManager = new ContextManager(mockRootPath);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('loadContext', () => {
    it('should return fresh context when no context file exists', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const context = await contextManager.loadContext();
      
      expect(context.recentPackages).toEqual([]);
      expect(context.sessionStart).toBeInstanceOf(Date);
      expect(context.lastActivity).toBeInstanceOf(Date);
    });

    it('should load existing context from file', async () => {
      const mockContext = {
        currentPackage: 'backend',
        recentPackages: ['backend', 'frontend', 'shared'],
        sessionStart: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockContext));

      const context = await contextManager.loadContext();
      
      expect(context.currentPackage).toBe('backend');
      expect(context.recentPackages).toEqual(['backend', 'frontend', 'shared']);
      expect(context.sessionStart).toBeInstanceOf(Date);
      expect(context.lastActivity).toBeInstanceOf(Date);
    });

    it('should handle corrupted context file', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('invalid json');

      const context = await contextManager.loadContext();
      
      expect(context.recentPackages).toEqual([]);
      expect(context.sessionStart).toBeInstanceOf(Date);
      expect(context.lastActivity).toBeInstanceOf(Date);
    });
  });

  describe('saveContext', () => {
    it('should save context to file', async () => {
      const context = {
        currentPackage: 'backend',
        recentPackages: ['backend', 'frontend'],
        sessionStart: new Date(),
        lastActivity: new Date()
      };

      await contextManager.saveContext(context);
      
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.monorepo-switcher-context.json'),
        expect.stringContaining('backend')
      );
    });
  });

  describe('updateContext', () => {
    it('should update context with new package', async () => {
      const initialContext = {
        recentPackages: ['frontend', 'shared'],
        sessionStart: new Date(),
        lastActivity: new Date()
      };

      // Mock initial context
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(initialContext));

      await contextManager.updateContext('backend');

      // Verify file was written
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
      
      // Read the saved context to verify
      const savedData = mockedFs.writeFileSync.mock.calls[0][1];
      const savedContext = JSON.parse(savedData.toString());
      
      expect(savedContext.recentPackages).toEqual(['backend', 'frontend', 'shared']);
      expect(savedContext.currentPackage).toBe('backend');
    });

    it('should limit recent packages to MAX_RECENT_PACKAGES', async () => {
      const initialContext = {
        recentPackages: Array(15).fill('').map((_, i) => `package-${i}`),
        sessionStart: new Date(),
        lastActivity: new Date()
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(initialContext));

      await contextManager.updateContext('new-package');

      const savedData = mockedFs.writeFileSync.mock.calls[0][1];
      const savedContext = JSON.parse(savedData.toString());
      
      expect(savedContext.recentPackages).toHaveLength(10);
      expect(savedContext.recentPackages[0]).toBe('new-package');
    });
  });

  describe('clearContext', () => {
    it('should remove context file if it exists', async () => {
      mockedFs.existsSync.mockReturnValue(true);

      await contextManager.clearContext();
      
      expect(mockedFs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('.monorepo-switcher-context.json')
      );
    });

    it('should not error if context file does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await contextManager.clearContext();
      
      expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
    });
  });
});