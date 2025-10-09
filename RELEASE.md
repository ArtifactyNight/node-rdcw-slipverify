# Release Guide

This document explains how to publish new versions of the `node-rdcw-slipverify` package to npm.

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

## Publishing Methods

### Method 1: Automated Release (Recommended)

Use the release script to create a new version:

```bash
# Create a new release
./scripts/release.sh 3.0.1

# Push to GitHub (this triggers automatic npm publishing)
git push origin main --follow-tags
```

The script will:

1. ✅ Validate the version format
2. ✅ Check if working directory is clean
3. ✅ Update `package.json` version
4. ✅ Update `package-lock.json`
5. ✅ Build the package
6. ✅ Commit the changes
7. ✅ Create a git tag (e.g., `v3.0.1`)

When you push the tag to GitHub, the GitHub Actions workflow will:

- Extract version from the tag
- Update package.json version
- Install dependencies
- Build the package
- Publish to npm with provenance
- Create a GitHub Release

### Method 2: Manual GitHub Workflow

You can also trigger a manual release from GitHub:

1. Go to **Actions** tab in your repository
2. Select **Publish to npm (Manual)** workflow
3. Click **Run workflow**
4. Enter the version number (e.g., `3.0.1`)
5. Click **Run workflow**

This will:

- Update version in package.json
- Build and publish to npm
- Commit changes back to the repository
- Create a git tag
- Create a GitHub Release

### Method 3: Local Manual Publishing

If you prefer to publish manually from your local machine:

```bash
# Update version
npm version 3.0.1

# Build the package
npm run build

# Publish to npm
npm publish

# Push changes and tags
git push origin main --follow-tags
```

## Version Numbering

Follow [Semantic Versioning (SemVer)](https://semver.org/):

- **Major version** (`X.0.0`): Breaking changes
- **Minor version** (`x.X.0`): New features (backward compatible)
- **Patch version** (`x.x.X`): Bug fixes (backward compatible)

Examples:

- `3.0.1` - Patch release
- `3.1.0` - Minor release
- `4.0.0` - Major release
- `3.1.0-beta.1` - Pre-release

## Workflow Files

### `.github/workflows/publish-npm.yml`

Automatically publishes when a tag is pushed:

```bash
git tag v3.0.1
git push origin v3.0.1
```

### `.github/workflows/publish-npm-manual.yml`

Manually triggered workflow from GitHub Actions UI.

## Troubleshooting

### Publishing Fails with Authentication Error

Make sure the `NPM_TOKEN` secret is set correctly in GitHub:

1. Verify the token is still valid on npmjs.com
2. Check the token has **Automation** permissions
3. Ensure the secret name is exactly `NPM_TOKEN`

### Version Already Exists on npm

npm doesn't allow republishing the same version. You need to:

1. Increment the version number
2. Create a new tag
3. Publish again

### Build Fails in GitHub Actions

Check the build logs in the Actions tab. Common issues:

- Missing dependencies in `package.json`
- TypeScript compilation errors
- Test failures (if you add tests)

## Best Practices

1. **Test Before Release**: Always test your changes locally before releasing
2. **Update Changelog**: Keep a CHANGELOG.md with notable changes
3. **Breaking Changes**: Bump major version for breaking changes
4. **Pre-releases**: Use pre-release versions for testing (e.g., `3.1.0-beta.1`)
5. **Clean Working Directory**: Commit all changes before creating a release

## Example Workflow

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new validation method"

# 2. Create a release
./scripts/release.sh 3.1.0

# 3. Push to GitHub (triggers automatic publishing)
git push origin main --follow-tags

# 4. Check GitHub Actions for publishing status
# 5. Verify the new version on npmjs.com
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
