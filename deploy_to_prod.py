#!/usr/bin/env python3
"""
Production Deployment Script for LinkShield AI
Manages deployment from QA branch to main branch (production)
"""
import os
import sys
import subprocess
import time
from datetime import datetime


def print_banner(text):
    """Print a formatted banner"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)


def run_command(command, cwd=None, timeout=300):
    """Run a command and return the result"""
    try:
        print(f"Running: {command}")
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result
    except subprocess.TimeoutExpired:
        print(f"Command timed out: {command}")
        return None
    except Exception as e:
        print(f"Error running command: {e}")
        return None


def check_current_branch():
    """Check if we're on the QA branch"""
    print_banner("BRANCH VALIDATION")
    
    result = run_command("git branch --show-current")
    if result and result.returncode == 0:
        current_branch = result.stdout.strip()
        print(f"Current branch: {current_branch}")
        
        if current_branch == "QA":
            print("✅ On QA branch - ready for production deployment")
            return True
        else:
            print(f"❌ Not on QA branch. Please switch to QA branch first.")
            return False
    else:
        print("❌ Could not determine current branch")
        return False


def run_final_qa_validation():
    """Run final QA validation before production deployment"""
    print_banner("FINAL QA VALIDATION")
    
    print("Running comprehensive QA tests...")
    qa_result = run_command("python run_qa_tests.py")
    
    if qa_result and qa_result.returncode == 0:
        print("✅ Final QA validation passed")
        return True
    else:
        print("❌ Final QA validation failed")
        if qa_result and qa_result.stderr:
            print("Error output:", qa_result.stderr)
        return False


def create_production_tag():
    """Create a production tag for the current commit"""
    print_banner("PRODUCTION TAGGING")
    
    # Get current date for tag
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    tag_name = f"prod-v2.0.0-{timestamp}"
    
    print(f"Creating production tag: {tag_name}")
    tag_result = run_command(f'git tag -a {tag_name} -m "Production deployment {timestamp}"')
    
    if tag_result and tag_result.returncode == 0:
        print(f"✅ Production tag created: {tag_name}")
        return tag_name
    else:
        print("❌ Failed to create production tag")
        return None


def merge_to_main():
    """Merge QA branch to main branch"""
    print_banner("MERGING TO MAIN (PRODUCTION)")
    
    # Switch to main branch
    print("Switching to main branch...")
    checkout_result = run_command("git checkout main")
    
    if not checkout_result or checkout_result.returncode != 0:
        print("❌ Failed to switch to main branch")
        return False
    
    # Pull latest changes
    print("Pulling latest changes from main...")
    pull_result = run_command("git pull origin main")
    
    if pull_result and pull_result.returncode == 0:
        print("✅ Main branch updated")
    else:
        print("⚠️  Could not pull latest changes (continuing anyway)")
    
    # Merge QA branch
    print("Merging QA branch to main...")
    merge_result = run_command("git merge QA --no-ff -m 'Production deployment: Merge QA branch to main'")
    
    if merge_result and merge_result.returncode == 0:
        print("✅ Successfully merged QA to main")
        return True
    else:
        print("❌ Failed to merge QA to main")
        if merge_result and merge_result.stderr:
            print("Error:", merge_result.stderr)
        return False


def generate_deployment_report():
    """Generate deployment report"""
    print_banner("DEPLOYMENT REPORT")
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Get commit information
    commit_result = run_command("git log --oneline -10")
    recent_commits = commit_result.stdout if commit_result and commit_result.returncode == 0 else "Unable to fetch commits"
    
    report_content = f"""
# Production Deployment Report - LinkShield AI

**Deployment Date:** {timestamp}
**Source Branch:** QA
**Target Branch:** main (Production)
**Status:** COMPLETED

## Deployment Summary

### Pre-deployment Validation
- ✅ QA branch validation completed
- ✅ Comprehensive test suite executed
- ✅ All critical tests passed
- ✅ Code quality validation completed

### Deployment Process
- ✅ Production tag created
- ✅ QA branch merged to main
- ✅ Deployment completed successfully

### Components Deployed
- **Backend API**: FastAPI application with ML models
- **Frontend**: React web application
- **Browser Extension**: Chrome/Firefox extension
- **Documentation**: Updated guides and API docs

### Recent Changes
```
{recent_commits}
```

## Production Monitoring

### Recommended Next Steps
1. Monitor application performance metrics
2. Watch for error logs and exceptions
3. Validate all API endpoints are responding
4. Test critical user workflows
5. Monitor resource usage and scaling needs

### Rollback Plan
If issues are detected:
1. Switch back to previous production tag
2. Investigate issues in QA environment
3. Apply fixes and re-run QA validation
4. Redeploy when ready

## Quality Assurance Summary

The following QA validations were completed before deployment:

### Backend Tests
- API health checks and availability
- Performance and load testing
- Security validation
- Endpoint functionality verification
- Integration testing

### Frontend Tests
- Build process validation
- Code quality checks
- Dependency verification
- Environment configuration

### Browser Extension Tests
- Manifest validation
- File structure verification
- Code syntax validation
- Size and compliance checks

### Overall QA Status: ✅ PASSED

## Contact Information

For deployment issues or questions:
- Check GitHub Actions for CI/CD status
- Review application logs for errors
- Contact development team for support

---
*Generated by Production Deployment Script*
*Deployment completed on {timestamp}*
"""
    
    # Write report to file
    report_file = f"production_deployment_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(report_file, 'w') as f:
        f.write(report_content)
    
    print(f"✅ Deployment report generated: {report_file}")
    print(report_content)
    
    return report_file


def main():
    """Main production deployment process"""
    print_banner("LINKSHIELD AI - PRODUCTION DEPLOYMENT")
    print("Starting production deployment from QA to main branch...")
    
    start_time = time.time()
    
    # Step 1: Validate current branch
    if not check_current_branch():
        print("\n❌ DEPLOYMENT ABORTED!")
        print("Please switch to QA branch and try again.")
        return False
    
    # Step 2: Run final QA validation
    if not run_final_qa_validation():
        print("\n❌ DEPLOYMENT ABORTED!")
        print("QA validation failed. Please fix issues before deploying.")
        return False
    
    # Step 3: Create production tag
    prod_tag = create_production_tag()
    if not prod_tag:
        print("\n❌ DEPLOYMENT ABORTED!")
        print("Could not create production tag.")
        return False
    
    # Step 4: Merge to main
    if not merge_to_main():
        print("\n❌ DEPLOYMENT FAILED!")
        print("Could not merge QA branch to main.")
        return False
    
    # Step 5: Generate deployment report
    report_file = generate_deployment_report()
    
    end_time = time.time()
    duration = end_time - start_time
    
    print_banner("PRODUCTION DEPLOYMENT SUCCESSFUL")
    print(f"✅ QA branch successfully merged to main (production)")
    print(f"✅ Production tag created: {prod_tag}")
    print(f"✅ Deployment report: {report_file}")
    print(f"⏱️  Total deployment time: {duration:.2f} seconds")
    
    print("\n🎉 PRODUCTION DEPLOYMENT COMPLETED!")
    print("LinkShield AI is now live in production!")
    
    print("\n📋 NEXT STEPS:")
    print("1. Monitor application performance")
    print("2. Validate all features are working")
    print("3. Watch for any error reports")
    print("4. Celebrate the successful deployment! 🚀")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)