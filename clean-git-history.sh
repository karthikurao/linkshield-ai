#!/bin/bash

# This script will remove large files from Git history
# Usage: bash clean-git-history.sh

# Display current repository size
echo "Current repository size:"
git count-objects -v -H

# Backup current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
echo "Current branch: $CURRENT_BRANCH"

# First, we need to rewrite history to remove the large files
echo "Removing large files from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
   backend/.serverless/**/* \
   ml_training/results/checkpoint-*/**/* \
   ml_training/venv_ml/**/* \
   ml_training/results/*.zip \
   **/*.safetensors \
   **/*.bin \
   **/__pycache__/**/*" \
  --prune-empty --tag-name-filter cat -- --all

# Then, clean up the references and garbage collect
echo "Cleaning up references..."
git for-each-ref --format="delete %(refname)" refs/original/ | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Create proper .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
  echo "Creating .gitignore file..."
  cat > .gitignore << EOL
# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
.pnpm-debug.log
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg
venv/
venv_ml/

# Serverless
.serverless/
node_modules/
.env

# ML related
*.bin
*.safetensors
*.pt
*.pth
*.onnx
model_checkpoints/
checkpoint-*/
ml_training/results/*.zip

# IDE
.idea/
.vscode/
*.swp
*.swo

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
EOL
fi

# Display final repository size
echo "Repository size after cleanup:"
git count-objects -v -H

echo "Large files have been removed from Git history."
echo "Next steps:"
echo "1. Verify the repository still works correctly"
echo "2. Push changes with 'git push origin $CURRENT_BRANCH --force'"
echo "3. Ask team members to clone the repository again"
