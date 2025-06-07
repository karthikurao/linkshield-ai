# Git Best Practices for Managing Large Files

This document outlines best practices for managing large files in the LinkShield AI repository to prevent repository bloat and ensure efficient collaboration.

## Managing Large Files

### Use Git LFS for Large Files

We use Git Large File Storage (LFS) to handle large files in our repository. The following file types are configured for LFS tracking:

- ML model files (*.safetensors, *.bin, *.pt, *.pth, *.onnx)
- Dataset files (*.csv, *.tsv, *.json, *.jsonl)
- Archive files (*.zip)

When working with these file types:

```bash
# First-time setup (already done for this repository)
git lfs install

# When adding new large files
git add path/to/large/file.bin
git commit -m "Add model file"
git push
```

### Keep an Eye on Git LFS Quota

If using GitHub or GitLab, be mindful of LFS storage and bandwidth quotas:

- Monitor your LFS usage in repository settings
- Consider implementing a cleanup policy for old LFS objects
- For very large datasets, consider external storage solutions

## Avoiding Common Mistakes

### Proper .gitignore Configuration

Our `.gitignore` file is set up to exclude common large file directories:

- `.serverless/` directory for serverless deployment artifacts
- `venv*/` directories for Python virtual environments
- `node_modules/` for JavaScript dependencies
- `__pycache__/` for Python bytecode
- ML training checkpoints

Always check that any new large file or directory pattern is either:
1. Added to `.gitignore` if it shouldn't be tracked
2. Added to `.gitattributes` for LFS if it should be tracked

### Check Before Committing

Before committing, check what files are being staged:

```bash
# See what would be committed
git status

# For a more detailed view of file sizes
git add -A
git status
git restore --staged .  # If you see unexpected large files
```

### Regular Repository Maintenance

Schedule regular maintenance to keep the repository healthy:

```bash
# Check repository size
git count-objects -v -H

# Prune unnecessary objects
git gc --aggressive --prune=now

# Verify LFS objects
git lfs fsck
```

## What To Do If Large Files Are Accidentally Committed

If large files are accidentally committed to the repository:

1. **Don't push** the changes if possible
2. Use `git reset --soft HEAD~1` to undo the last commit while keeping changes
3. Add the file pattern to `.gitignore`
4. Set up Git LFS for the file type if needed
5. Commit again with proper LFS tracking

If the changes have already been pushed:

1. Follow the instructions in `clean-git-history.ps1`
2. Use with caution as it rewrites history
3. Communicate with all team members before doing this

## Special Considerations for ML Projects

### Model Checkpoints

- Store the final model in Git LFS
- Keep intermediate checkpoints in `.gitignore`
- Consider using external storage (S3, Azure Blob) for training checkpoints

### Training Datasets

- Small, processed datasets can go in Git LFS
- Raw data should be stored externally
- Document the data sources and preprocessing steps

### Python Dependencies

- Never commit virtual environment directories
- Use `requirements.txt` or `environment.yml` to specify dependencies
- Consider using Docker for reproducible environments

## CI/CD Considerations

When setting up CI/CD pipelines:

- Configure Git LFS support in your CI system
- Set appropriate Git clone depth to speed up workflows
- Cache dependencies to avoid repeated downloads
- Use artifacts for passing large files between jobs
