# ✅ semantic-release Setup Complete!

This project has been successfully migrated to use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for automated releases.

## 📦 What Was Installed

```json
{
  "devDependencies": {
    "semantic-release": "^24.2.9",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^11.0.6",
    "@semantic-release/npm": "^12.0.2",
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0"
  }
}
```

## 📝 New Files Created

1. **`.releaserc.json`** - semantic-release configuration
2. **`.commitlintrc.json`** - Commit message validation
3. **`MIGRATION_TO_SEMANTIC_RELEASE.md`** - Migration guide
4. **`SETUP_COMPLETE.md`** - This file

## 🔄 Modified Files

1. **`.github/workflows/publish-npm.yml`**

   - Changed trigger from `tags` to `push to main`
   - Now runs `semantic-release` instead of manual npm publish

2. **`.github/workflows/publish-npm-manual.yml`**

   - Marked as deprecated (kept as fallback)

3. **`package.json`**

   - Added `semantic-release` script
   - Added `CHANGELOG.md` to files array

4. **`README.md`**

   - Added semantic-release badge
   - Added commit message convention section

5. **`RELEASE.md`**

   - Complete rewrite with semantic-release workflow
   - Removed manual release instructions
   - Added commit convention examples

6. **`scripts/release.sh`**
   - Replaced with deprecation notice

## 🚀 How to Use

### Simple Release Flow

```bash
# 1. Make changes
vim src/index.ts

# 2. Commit with conventional format
git add .
git commit -m "feat(api): add custom timeout option"

# 3. Push to main
git push origin main

# 4. Done! 🎉
# semantic-release automatically:
#   - Bumps version (3.0.0 → 3.1.0)
#   - Updates CHANGELOG.md
#   - Publishes to npm
#   - Creates GitHub Release
#   - Commits changes back to main
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types that trigger releases:**

- `fix:` → Patch release (1.0.0 → 1.0.1)
- `feat:` → Minor release (1.0.0 → 1.1.0)
- `perf:` → Patch release
- `refactor:` → Patch release (custom config)
- `style:` → Patch release (custom config)
- `BREAKING CHANGE:` → Major release (1.0.0 → 2.0.0)

**Types that don't trigger releases:**

- `docs:`
- `chore:`
- `test:`
- `ci:`
- `build:`

### Examples

```bash
# Patch release
git commit -m "fix(validation): correct bank code validation"

# Minor release
git commit -m "feat(locale): add French language support"

# Major release (breaking change)
git commit -m "feat(api)!: redesign SDK initialization

BREAKING CHANGE: Changed from class-based to factory function pattern.
See migration guide for details."
```

## 🔍 Test semantic-release (Optional)

You can test what semantic-release would do without publishing:

```bash
# Dry run
npx semantic-release --dry-run

# This will show:
# - What version would be released
# - What commits would be included
# - What would be in the changelog
```

## ⚙️ Configuration

### `.releaserc.json` - semantic-release Config

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

### `.commitlintrc.json` - Commit Message Validation

You can optionally set up git hooks to validate commit messages:

```bash
# Install husky for git hooks
npm install --save-dev husky

# Initialize husky
npx husky init

# Add commit-msg hook
echo "npx --no-install commitlint --edit \$1" > .husky/commit-msg
chmod +x .husky/commit-msg
```

This will validate commit messages before they're committed.

## 🔐 GitHub Secrets Required

Make sure these secrets are set in your GitHub repository:

1. **`NPM_TOKEN`** - Your npm automation token

   - Go to: Settings → Secrets and variables → Actions
   - This should already be set up from before

2. **`GITHUB_TOKEN`** - Automatically provided by GitHub Actions
   - No action needed

## 📚 Documentation

- **`RELEASE.md`** - Complete release guide
- **`MIGRATION_TO_SEMANTIC_RELEASE.md`** - Migration details
- **`README.md`** - Updated with commit conventions
- [semantic-release docs](https://semantic-release.gitbook.io/semantic-release/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ✅ Next Steps

1. **Review the configuration** - Check `.releaserc.json` if you want to customize
2. **Read RELEASE.md** - Detailed workflow documentation
3. **Practice commits** - Start using conventional commit format
4. **Test it out** - Make a commit and push to see it in action!

## 🎯 Quick Reference Card

| Action                     | Command                                     |
| -------------------------- | ------------------------------------------- |
| Bug fix (patch)            | `git commit -m "fix: ..."`                  |
| New feature (minor)        | `git commit -m "feat: ..."`                 |
| Breaking change (major)    | Add `BREAKING CHANGE:` in footer            |
| No release                 | `git commit -m "docs: ..."` or `chore: ...` |
| Test semantic-release      | `npx semantic-release --dry-run`            |
| Manual publish (emergency) | `npm run build && npm publish`              |

## 🚨 Important Notes

1. **Version in package.json** - Don't edit manually! semantic-release manages it.
2. **CHANGELOG.md** - Auto-generated, don't edit manually.
3. **Commit messages** - Follow the convention, they determine releases!
4. **Main branch** - Only pushes to `main` trigger releases.

## 🐛 Troubleshooting

### No release was created

Check your commits - only certain types trigger releases:

- ✅ `fix:`, `feat:`, `perf:`, `refactor:`, `style:`
- ❌ `docs:`, `chore:`, `test:`, `ci:`

### Workflow failed

1. Check GitHub Actions logs
2. Verify `NPM_TOKEN` secret is set
3. Ensure npm account has publish permissions

### Need to skip CI

Add `[skip ci]` to your commit message:

```bash
git commit -m "docs: update readme [skip ci]"
```

## 🎉 You're All Set!

Your repository is now configured for fully automated releases!

Just commit with conventional format and push to `main`. semantic-release will handle everything else.

**Happy releasing! 🚀**

---

**Questions?** Read `RELEASE.md` or visit the [semantic-release documentation](https://semantic-release.gitbook.io/semantic-release/).
