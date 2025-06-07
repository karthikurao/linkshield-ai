# Remove large files from Git history

# First, let's create a better .gitignore file
$gitignoreContent = @"
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
*.zip

# ML related
*.bin
*.safetensors
*.pt
*.pth
*.onnx
model_checkpoints/
checkpoint-*/
ml_training/results/*.zip
"@

Set-Content -Path .gitignore -Value $gitignoreContent

# Create a fresh branch
$currentBranch = git symbolic-ref --short HEAD
git checkout --orphan temp_branch

# Add all files that should be in the repository
git add -A

# Create a commit with the clean state
git commit -m "Initial commit with clean history"

# Remove the old branch
git branch -D $currentBranch

# Rename the temp branch
git branch -m $currentBranch

# Force garbage collection
git gc --aggressive --prune=now

# Display repository size
Write-Host "Repository size after cleanup:"
git count-objects -v -H

Write-Host "Next steps:"
Write-Host "1. Verify the repository still works correctly"
Write-Host "2. Push changes with 'git push origin $currentBranch --force'"
Write-Host "3. Ask team members to clone the repository again"
