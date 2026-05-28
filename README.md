# monorepo-switcher

[![npm version](https://badge.fury.io/js/monorepo-switcher.svg)](https://badge.fury.io/js/monorepo-switcher)
[![Build Status](https://github.com/quadbyte/monorepo-switcher/actions/workflows/ci.yml/badge.svg)](https://github.com/quadbyte/monorepo-switcher/actions/workflows/ci.yml)

Intelligent CLI for fast monorepo workspace switching with context awareness.

## Features

- 🔍 **Fast Discovery**: Instantly discovers all packages in your monorepo
- 🎯 **Smart Switching**: Quick navigation between packages with fuzzy search
- 📊 **Context Awareness**: Shows package type, git status, and recent activity
- 📝 **Session History**: Remembers recently used packages
- 🎨 **Rich Output**: Beautiful terminal formatting with colors and icons
- ⚡ **Lightweight**: No external dependencies, fast startup time

## Installation

```bash
npm install -g monorepo-switcher
```

## Usage

### List all packages

```bash
monorepo-switcher
```

### Switch to a specific package

```bash
monorepo-switcher backend
monorepo-switcher frontend
monorepo-switcher shared
```

### Show recently used packages

```bash
monorepo-switcher --recent
```

### Fuzzy search for packages

```bash
monorepo-switcher --fuzzy
```

### Show help

```bash
monorepo-switcher --help
```

### Show version

```bash
monorepo-switcher --version
```

## Examples

```bash
# List all packages in current monorepo
$ monorepo-switcher

📦 Monorepo: /Users/dev/my-project (12 packages)

🎯 RECENTLY USED:
├── backend/          ⚠️ modified
├── frontend/        ✅ clean
└── shared/          🔥 active

🔍 ALL PACKAGES:
├── backend/ (Node.js) - REST API service
├── frontend/ (React) - Web UI  
├── shared/ (TypeScript) - Common utilities
├── admin/ (React) - Admin dashboard
├── mobile/ (React Native) - Mobile app
└── docs/ (Markdown) - Project documentation

# Switch to backend package
$ monorepo-switcher backend
🎯 Switching to backend...
✅ Successfully switched to /Users/dev/my-project/backend

# Show recently used packages
$ monorepo-switcher --recent
📦 Monorepo: /Users/dev/my-project (12 packages)

🎯 RECENTLY USED:
├── backend/          ⚠️ modified
├── frontend/        ✅ clean
└── shared/          🔥 active
```

## Status Icons

- ✅ **clean**: No changes in git
- ⚠️ **modified**: Has changes in git
- ❌ **untracked**: Has untracked files

## Package Types

- **Node.js**: Node.js package with TypeScript
- **React**: React application
- **Next.js**: Next.js application
- **React Native**: React Native application
- **Docs**: Documentation package
- **Unknown**: Unrecognized package type

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
git clone https://github.com/quadbyte/monorepo-switcher.git
cd monorepo-switcher
npm install
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] VS Code extension integration
- [ ] Session persistence across terminal restarts
- [ ] Custom monorepo configuration
- [ ] Package dependency visualization
- [ ] Advanced fuzzy search with fuzzy matching library
- [ ] Git branch integration
- [ ] Custom output formats (JSON, YAML)

## Support

- 📧 Email: support@quadbyte.dev
- 🐛 Issues: [GitHub Issues](https://github.com/quadbyte/monorepo-switcher/issues)
- 💬 Discord: [Join our community](https://discord.gg/monorepo-switcher)

---

Made with ❤️ by [Quadbyte](https://quadbyte.dev)