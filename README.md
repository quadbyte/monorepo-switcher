# monorepo-switcher

Intelligent CLI for fast monorepo workspace switching with context awareness and smart discovery.

## Features

- 🔍 **Fast Discovery**: Instantly list all packages in your monorepo
- 🎯 **Smart Switching**: Quickly navigate between packages with intelligent completion
- 📊 **Context Awareness**: See git status and recent activity for each package
- 🕐 **Session Persistence**: Remember your workspace context across terminal sessions
- 🔧 **Framework Detection**: Auto-detect package types (React, Node.js, Next.js, etc.)
- 🎨 **Rich UI**: Beautiful terminal output with colors and icons

## Installation

```bash
npm install -g monorepo-switcher
```

## Usage

### List all packages

```bash
monorepo-switcher list
# or
monorepo-switcher ls
```

### Switch to a specific package

```bash
monorepo-switcher switch backend
# or
monorepo-switcher s backend
```

### Show recently used packages

```bash
monorepo-switcher recent
```

### Filter packages

```bash
# Show only recently used packages
monorepo-switcher list --recent

# Show only packages with uncommitted changes
monorepo-switcher list --dirty

# Filter by package type
monorepo-switcher list --type react
```

### Generate shell completion

```bash
# For bash
monorepo-switcher completion --shell bash

# For zsh
monorepo-switcher completion --shell zsh
```

## Examples

### Basic usage

```bash
$ monorepo-switcher

📦 Monorepo: /Users/dev/my-project (12 packages)

🎯 RECENTLY USED:
├── backend/          ⚠️ 2 files modified
├── frontend/        ✅ clean
└── shared/          🔥 5 files modified (active)

🔍 ALL PACKAGES:
├── backend/ (Node.js) - REST API service
├── frontend/ (React) - Web UI  
├── shared/ (TypeScript) - Common utilities
├── admin/ (React) - Admin dashboard
├── mobile/ (React Native) - Mobile app
└── docs/ (Markdown) - Project documentation

Switch to package: backend
```

### Quick switching

```bash
$ monorepo-switcher backend

🚀 Switching to package: backend
📁 Path: /Users/dev/my-project/packages/backend

💡 To navigate to this package, run: cd "/Users/dev/my-project/packages/backend"
✅ Directory change recorded. You can now navigate to: /Users/dev/my-project/packages/backend
```

## Requirements

- Node.js >= 18.0.0
- Git (for git status detection)

## Supported Monorepo Structures

monorepo-switcher automatically detects packages in common monorepo layouts:

```
my-project/
├── packages/
│   ├── backend/
│   ├── frontend/
│   └── shared/
├── apps/
│   ├── web/
│   └── mobile/
├── libs/
│   ├── ui/
│   └── utils/
└── workspaces/
    ├── admin/
    └── api/
```

## Package Detection

The tool automatically detects package types based on dependencies:

- **Node.js**: Express, Koa, Hapi, or other Node.js frameworks
- **React**: React and React DOM dependencies
- **Next.js**: React + Next.js dependencies
- **React Native**: React Native dependencies
- **Docs**: Docusaurus, Docsify, VuePress, or other documentation tools
- **Unknown**: Unrecognized package types

## Configuration

monorepo-switcher is designed to work out of the box with zero configuration. However, you can customize its behavior by creating a `.monorepo-switcher.json` file in your monorepo root:

```json
{
  "packagePatterns": ["packages", "apps", "libs", "workspaces"],
  "excludePatterns": ["**/node_modules/**", "**/.git/**"],
  "maxDepth": 3
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/quadbyte/monorepo-switcher.git
cd monorepo-switcher

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

## License

MIT - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## Roadmap

- [ ] Fuzzy search for package names
- [ ] Integration with VS Code
- [ ] Package dependency visualization
- [ ] Session persistence across terminal restarts
- [ ] Configuration file customization
- [ ] Integration with popular monorepo tools (Turbo, Nx)

## Support

If you encounter any issues or have questions, please [file an issue](https://github.com/quadbyte/monorepo-switcher/issues).