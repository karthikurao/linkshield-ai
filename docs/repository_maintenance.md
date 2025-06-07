# Repository Cleanup Guide

This document explains how to maintain a clean repository for the LinkShield AI project and avoid committing large files to Git.

## Size Guidelines

GitHub has the following limitations:
- GitHub.com: 100 MB file size limit, 2 GB repository size soft limit
- Git LFS: Required for files larger than 50 MB

## Files to Never Commit

1. **Virtual Environments**
   - Never commit the `backend/venv` directory
   - Use `requirements.txt` instead

2. **Node Modules**
   - Never commit `frontend/node_modules`
   - Use package.json and run `npm install` locally

3. **Large ML Datasets**
   - Large datasets should be downloaded separately
   - Include small sample datasets for development
   - Consider using Git LFS for critical large files

4. **Build Artifacts**
   - Never commit compiled binaries or build outputs
   - Generate these locally with build scripts

## Cleanup Instructions

If you need to clean up a repository that already has large files:

1. **Remove virtual environment**:
   ```bash
   git rm -r --cached backend/venv
   ```

2. **Remove node_modules**:
   ```bash
   git rm -r --cached frontend/node_modules
   ```

3. **Create/update .gitignore**:
   Ensure your `.gitignore` file includes:
   ```
   # Virtual environments
   venv/
   .venv/
   env/
   
   # Node modules
   node_modules/
   
   # Build artifacts
   dist/
   build/
   
   # Large data files
   *.csv
   *.zip
   *.tar.gz
   ```

4. **Use Git LFS for large files (if needed)**:
   ```bash
   git lfs install
   git lfs track "*.csv"
   git add .gitattributes
   ```

5. **If history contains large files**:
   For a deep clean (rewrites history):
   ```bash
   # Install BFG Repo-Cleaner
   java -jar bfg.jar --strip-blobs-bigger-than 50M your-repo.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

## Best Practices

1. **Environment Setup**:
   - Use `requirements.txt` for Python dependencies
   - Use `package.json` for JavaScript dependencies

2. **Data Management**:
   - Store large datasets in cloud storage (S3, etc.)
   - Download only when needed
   - Include scripts to download/prepare data

3. **Dependency Management**:
   - Use virtual environments for Python
   - Use npm/yarn for JavaScript
   - Document all dependencies properly

4. **Documentation**:
   - Document setup process in README.md
   - Include instructions for handling large files
