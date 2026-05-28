import { PackageDiscovery } from '../src/discovery';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs and simple-git for testing
jest.mock('fs/promises');
jest.mock('simple-git');

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedGit = require('simple-git') as jest.MockedFunction<() => any>;

describe('PackageDiscovery', () => {
  let discovery: PackageDiscovery;

  beforeEach(() => {
    discovery = new PackageDiscovery();
    jest.clearAllMocks();
  });

  describe('detectPackageType', () => {
    it('should detect Next.js package', () => {
      const pkg = { dependencies: { next: '^13.0.0' } };
      expect(discovery['detectPackageType'](pkg)).toBe('next');
    });

    it('should detect React package', () => {
      const pkg = { dependencies: { react: '^18.0.0' } };
      expect(discovery['detectPackageType'](pkg)).toBe('react');
    });

    it('should detect React Native package', () => {
      const pkg = { dependencies: { 'react-native': '^0.70.0' } };
      expect(discovery['detectPackageType'](pkg)).toBe('react-native');
    });

    it('should detect Node.js package', () => {
      const pkg = { dependencies: { typescript: '^5.0.0' } };
      expect(discovery['detectPackageType'](pkg)).toBe('node');
    });

    it('should detect docs package', () => {
      const pkg = { name: 'docs' };
      expect(discovery['detectPackageType'](pkg)).toBe('docs');
    });

    it('should return unknown for unrecognized packages', () => {
      const pkg = { dependencies: { lodash: '^4.17.0' } };
      expect(discovery['detectPackageType'](pkg)).toBe('unknown');
    });
  });

  describe('parsePackage', () => {
    it('should parse package.json correctly', async () => {
      const mockContent = JSON.stringify({
        name: 'test-package',
        description: 'Test package',
        dependencies: { react: '^18.0.0' },
        scripts: { test: 'jest', build: 'tsc' }
      });

      mockedFs.readFile.mockResolvedValue(mockContent);
      mockedFs.stat.mockResolvedValue({ mtime: new Date() } as any);
      mockedGit.mockReturnValue({ status: jest.fn().mockResolvedValue({ files: [] }) });

      const result = await discovery['parsePackage']('test/package.json');

      expect(result).toEqual({
        name: 'test-package',
        path: 'test',
        type: 'react',
        dependencies: ['react'],
        scripts: ['test', 'build'],
        gitStatus: 'clean',
        recentActivity: expect.any(Date),
        description: 'Test package'
      });
    });

    it('should handle malformed package.json', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('Invalid JSON'));
      
      const result = await discovery['parsePackage']('test/package.json');
      expect(result).toBeNull();
    });
  });
});