#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if version argument is provided
if [ -z "$1" ]; then
    print_error "Usage: ./scripts/release.sh <version>"
    print_info "Example: ./scripts/release.sh 3.0.1"
    print_info "Example: ./scripts/release.sh 3.1.0-beta.1"
    exit 1
fi

VERSION=$1

# Validate version format (semantic versioning)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
    print_error "Invalid version format: $VERSION"
    print_info "Please use semantic versioning (e.g., 1.0.0, 2.1.3, 3.0.0-beta.1)"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi

print_info "Creating release for version: $VERSION"

# Update package.json version
print_info "Updating package.json version..."
npm version "$VERSION" --no-git-tag-version

# Update package-lock.json
print_info "Updating package-lock.json..."
npm install --package-lock-only

# Build the package
print_info "Building package..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

# Commit changes
print_info "Committing version update..."
git add package.json package-lock.json
git commit -m "chore: bump version to $VERSION"

# Create and push tag
print_info "Creating tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

print_success "Release prepared successfully!"
print_info "To publish to npm, push the tag to GitHub:"
echo ""
echo "  git push origin main --follow-tags"
echo ""
print_info "This will trigger the GitHub Actions workflow to publish to npm automatically."
print_info "Alternatively, you can publish manually:"
echo ""
echo "  npm publish"
echo ""

