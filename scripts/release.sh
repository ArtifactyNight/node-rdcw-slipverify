#!/bin/bash

# Color codes for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}⚠️  DEPRECATION NOTICE ⚠️${NC}"
echo ""
echo -e "${BLUE}This manual release script is deprecated.${NC}"
echo ""
echo "This project now uses semantic-release for automated releases."
echo "Simply push commits to the 'main' branch following conventional commit format:"
echo ""
echo "Examples:"
echo "  ${BLUE}fix(validation): correct bank code check${NC}"
echo "  ${BLUE}feat(locale): add Thai language support${NC}"
echo "  ${BLUE}feat(api)!: redesign SDK API${NC} (breaking change)"
echo ""
echo "semantic-release will automatically:"
echo "  ✅ Determine the next version"
echo "  ✅ Generate changelog"
echo "  ✅ Publish to npm"
echo "  ✅ Create GitHub release"
echo ""
echo "For more information, see:"
echo "  📖 RELEASE.md"
echo "  📖 https://semantic-release.gitbook.io/semantic-release/"
echo ""
echo -e "${YELLOW}If you need to publish manually, use:${NC}"
echo "  npm run build && npm publish"
echo ""
