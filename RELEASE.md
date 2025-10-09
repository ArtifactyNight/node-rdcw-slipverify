# Release Guide

This document explains how releases are automated for the `node-rdcw-slipverify` package using [semantic-release](https://semantic-release.gitbook.io/semantic-release/).

## Overview

This project uses **semantic-release** to fully automate the release workflow. There's no need to manually bump versions, create tags, or publish to npm. Everything is automated based on your commit messages!

## Setup

### 1. NPM Authentication Token

To publish to npm via GitHub Actions, you need to create an npm access token:

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to **Access Tokens** in your account settings
3. Click **Generate New Token** → **Classic Token**
4. Select **Automation** type (for CI/CD)
5. Copy the generated token

### 2. Add NPM Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

## How It Works

### Automated Release Process

semantic-release analyzes your commit messages and automatically:

- 🎯 Determines the next version number (following [Semantic Versioning](https://semver.org/))
- 📝 Generates a changelog (`CHANGELOG.md`)
- 🏷️ Creates a git tag
- 📦 Publishes to npm with provenance
- 🚀 Creates a GitHub Release with release notes
- ✍️ Commits updated files back to the repository

**All of this happens automatically when you push to the `main` branch!**

## Commit Message Convention

This project follows the [Angular Commit Message Convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).

### Format

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Commit Types and Release Impact

| Commit Type        | Release Type          | Example                                    |
| ------------------ | --------------------- | ------------------------------------------ |
| `fix:`             | Patch (1.0.0 → 1.0.1) | `fix(validation): correct bank code check` |
| `feat:`            | Minor (1.0.0 → 1.1.0) | `feat(locale): add Thai language support`  |
| `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | See below                                  |
| `docs:`            | No release            | `docs(readme): update examples`            |
| `chore:`           | No release            | `chore(deps): update dependencies`         |
| `refactor:`        | Patch\*               | `refactor(api): simplify validation logic` |
| `perf:`            | Patch                 | `perf(qr): optimize QR code parsing`       |
| `style:`           | Patch\*               | `style(format): apply prettier formatting` |

\*configured in `.releaserc.json`

### Breaking Changes

To trigger a **major version release**, add `BREAKING CHANGE:` in the commit footer:

```bash
feat(api): redesign validation interface

BREAKING CHANGE: The validate method now returns a Result type instead of throwing errors.
Migration guide available in documentation.
```

### Commit Examples

#### Patch Release (Bug Fix)

```bash
fix(qr): handle corrupted QR code images properly
```

#### Minor Release (New Feature)

```bash
feat(validation): add custom timeout configuration

Allow users to configure API request timeout via options.
```

#### Major Release (Breaking Change)

```bash
feat(api): redesign SDK initialization

BREAKING CHANGE: Changed from class-based to factory function pattern.

Before:
  const rdcw = new RdcwVerify({ clientId, secret });

After:
  const rdcw = createRdcwVerify({ clientId, secret });
```

#### No Release

```bash
docs(readme): fix typo in usage example
```

```bash
chore(deps): update axios to v1.8.1
```

## Publishing a New Release

### Step 1: Make Changes and Commit

Follow the commit message convention when committing your changes:

```bash
# Make your changes
git add .

# Commit with conventional format
git commit -m "feat(locale): add French language support"
```

### Step 2: Push to Main

```bash
git push origin main
```

That's it! 🎉

### Step 3: Automated Process

GitHub Actions will automatically:

1. ✅ Analyze your commits
2. ✅ Determine the next version (e.g., 1.2.0 → 1.3.0 for a `feat:` commit)
3. ✅ Update `package.json` and `package-lock.json`
4. ✅ Generate or update `CHANGELOG.md`
5. ✅ Build the package
6. ✅ Publish to npm with provenance
7. ✅ Create a git tag (e.g., `v1.3.0`)
8. ✅ Create a GitHub Release with release notes
9. ✅ Commit updated files back to main

## Multiple Commits

If you push multiple commits, semantic-release will:

- Analyze all commits since the last release
- Determine the highest version bump needed
- Include all changes in the release notes

**Example:**

```bash
fix(api): fix timeout issue          # Would trigger patch (1.0.0 → 1.0.1)
feat(locale): add Thai support       # Would trigger minor (1.0.0 → 1.1.0)
```

Push both → Result: **1.1.0** (minor takes precedence) with both changes in release notes

## Verifying Releases

### Check Release Status

1. Go to your GitHub repository
2. Click on **Actions** tab
3. View the latest workflow run
4. Check the **Release** job for details

### View Published Package

- npm: https://www.npmjs.com/package/node-rdcw-slipverify
- GitHub Releases: https://github.com/nightkungz/node-rdcw-slipverify/releases

## Manual Publishing (Fallback)

If you need to publish manually (e.g., for testing or if automation fails):

### Method 1: Use the Manual GitHub Workflow

1. Go to **Actions** → **Publish to npm (Manual)**
2. Click **Run workflow**
3. Enter the version (e.g., `3.0.1`)
4. Click **Run workflow**

### Method 2: Publish Locally

```bash
# Ensure you're logged in to npm
npm login

# Build and publish
npm run build
npm publish
```

## Configuration

### semantic-release Configuration (`.releaserc.json`)

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer", // Analyzes commits
    "@semantic-release/release-notes-generator", // Generates release notes
    "@semantic-release/changelog", // Updates CHANGELOG.md
    "@semantic-release/npm", // Publishes to npm
    "@semantic-release/github", // Creates GitHub Release
    "@semantic-release/git" // Commits updated files
  ]
}
```

### Workflow File (`.github/workflows/publish-npm.yml`)

The GitHub Actions workflow is triggered on every push to `main` and runs semantic-release.

## Troubleshooting

### Release Didn't Trigger

Check if your commits follow the convention:

- ✅ `feat(api): add new method`
- ✅ `fix(validation): correct logic`
- ❌ `update code` (no type)
- ❌ `fixed bug` (no type)

### Version Not Updated

- Only `fix:`, `feat:`, `perf:`, and breaking changes trigger releases
- `docs:`, `chore:`, `test:`, `ci:` commits don't trigger releases (unless configured)

### Workflow Failed

1. Check the GitHub Actions logs
2. Common issues:
   - Missing `NPM_TOKEN` secret
   - npm authentication failure
   - Build errors
   - Merge conflicts in automated commits

## Best Practices

1. **Write clear commit messages** - They become your release notes
2. **Group related changes** - Commit logical units together
3. **Use scopes** - Help categorize changes (e.g., `feat(api):`, `fix(validation):`)
4. **Document breaking changes** - Always explain migration steps
5. **Test before pushing** - Ensure builds pass locally
6. **Review the changelog** - Check generated `CHANGELOG.md` after releases

## Tools to Help with Commits

### Commitizen

Interactive commit message generator:

```bash
npm install -g commitizen cz-conventional-changelog

# Use 'git cz' instead of 'git commit'
git cz
```

### Commitlint

Validate commit messages in git hooks:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky

# Setup git hooks
npx husky install
npx husky add .git/hooks/commit-msg 'npx commitlint --edit $1'
```

## Resources

- [semantic-release documentation](https://semantic-release.gitbook.io/semantic-release/)
- [Angular Commit Message Convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Summary

✨ **No more manual version management!** Just write good commit messages and push to `main`. semantic-release handles everything else automatically.

🎯 **Key Takeaway**: Your commit messages determine your releases. Use conventional commits, and let automation do the rest!
