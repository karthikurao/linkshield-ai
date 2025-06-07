# PowerShell script to clean Git repository history

# Display current repository size
Write-Host "Current repository size:"
git count-objects -v -H

# Get current branch
$CurrentBranch = git symbolic-ref --short HEAD
Write-Host "Current branch: $CurrentBranch"

# First, rewrite history to remove large files
Write-Host "Removing large files from Git history..."
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch backend/.serverless/**/* ml_training/results/checkpoint-*/**/* ml_training/venv_ml/**/* ml_training/results/*.zip **/*.safetensors **/*.bin **/__pycache__/**/*" `
  --prune-empty --tag-name-filter cat -- --all

# Clean up references and garbage collect
Write-Host "Cleaning up references..."
git for-each-ref --format="delete %(refname)" refs/original/ | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Create proper .gitignore if it doesn't exist
if (-not (Test-Path .gitignore)) {
  Write-Host "Creating .gitignore file..."
  @"
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
"@ | Set-Content -Path .gitignore
}

# Display final repository size
Write-Host "Repository size after cleanup:"
git count-objects -v -H

Write-Host "Large files have been removed from Git history."
Write-Host "Next steps:"
Write-Host "1. Verify the repository still works correctly"
Write-Host "2. Push changes with 'git push origin $CurrentBranch --force'"
Write-Host "3. Ask team members to clone the repository again"
