# fresh-clean.ps1
# This script creates a brand new repository with just the current files, removing all history

# Step 1: Backup current files that we want to keep
$backupDir = "d:\Projects\linkshield-ai-backup"
Write-Host "Backing up current files to $backupDir"
New-Item -ItemType Directory -Force -Path $backupDir
Copy-Item -Path "d:\Projects\linkshield-ai\*" -Destination $backupDir -Recurse -Force -Exclude ".git",".serverless","ml_training/results/checkpoint-*","ml_training/venv_ml"

# Step 2: Delete the .git directory to remove all history
$gitDir = "d:\Projects\linkshield-ai\.git"
if (Test-Path $gitDir) {
    Write-Host "Removing Git history"
    Remove-Item -Path $gitDir -Recurse -Force
}

# Step 3: Initialize a new repository
Write-Host "Initializing a new Git repository"
Set-Location -Path "d:\Projects\linkshield-ai"
git init

# Step 4: Configure Git LFS
Write-Host "Configuring Git LFS"
git lfs install

# Step 5: Add and commit all files
Write-Host "Adding all files to the new repository"
git add .
git commit -m "Initial commit with clean repository"

# Step 6: Add the remote origin
Write-Host "Adding remote origin"
git remote add origin https://github.com/karthikurao/linkshield-ai.git

# Step 7: Push to remote with force
Write-Host "Pushing to remote (this will overwrite the remote repository)"
Write-Host "You'll need to confirm this action by typing 'yes' when prompted"
$confirmation = Read-Host "Are you sure you want to force push and overwrite the remote repository? (yes/no)"
if ($confirmation -eq "yes") {
    git push -u origin main --force
    Write-Host "Repository has been successfully reset and pushed to remote."
} else {
    Write-Host "Operation cancelled. The local repository has been reset but not pushed to remote."
}
