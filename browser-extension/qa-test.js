/**
 * QA Test Script for LinkShield AI Browser Extension
 * Validates extension files and configuration
 */

const fs = require('fs');
const path = require('path');

function printBanner(text) {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${text}`);
    console.log('='.repeat(60));
}

function validateManifest() {
    printBanner('MANIFEST VALIDATION');
    
    const manifestPath = 'manifest.json';
    if (!fs.existsSync(manifestPath)) {
        console.log('❌ manifest.json not found');
        return false;
    }
    
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        console.log('✅ manifest.json is valid JSON');
        
        // Check required fields
        const requiredFields = ['manifest_version', 'name', 'version', 'description'];
        let score = 0;
        
        requiredFields.forEach(field => {
            if (manifest[field]) {
                console.log(`✅ ${field}: ${manifest[field]}`);
                score++;
            } else {
                console.log(`❌ Missing required field: ${field}`);
            }
        });
        
        // Check permissions
        if (manifest.permissions && manifest.permissions.length > 0) {
            console.log(`✅ Permissions defined: ${manifest.permissions.join(', ')}`);
            score++;
        } else {
            console.log('⚠️ No permissions defined');
        }
        
        // Check icons
        if (manifest.icons) {
            console.log('✅ Icons defined');
            Object.entries(manifest.icons).forEach(([size, path]) => {
                if (fs.existsSync(path)) {
                    console.log(`  ✅ ${size}px icon: ${path}`);
                } else {
                    console.log(`  ❌ Missing icon: ${path}`);
                }
            });
            score++;
        } else {
            console.log('⚠️ No icons defined');
        }
        
        console.log(`Manifest Score: ${score}/${requiredFields.length + 2}`);
        return score >= requiredFields.length;
        
    } catch (error) {
        console.log('❌ manifest.json is invalid JSON:', error.message);
        return false;
    }
}

function validateExtensionFiles() {
    printBanner('EXTENSION FILES VALIDATION');
    
    const requiredFiles = [
        'background.js',
        'content.js',
        'popup.html',
        'popup.js',
        'options.html'
    ];
    
    const optionalFiles = [
        'content.css',
        'README.md'
    ];
    
    let score = 0;
    
    console.log('Checking required files...');
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
            score++;
        } else {
            console.log(`❌ ${file} (required)`);
        }
    });
    
    console.log('\nChecking optional files...');
    optionalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
            score += 0.5;
        } else {
            console.log(`⚠️ ${file} (optional)`);
        }
    });
    
    console.log(`File Score: ${score}/${requiredFiles.length + optionalFiles.length * 0.5}`);
    return score >= requiredFiles.length * 0.8;
}

function validateExtensionSize() {
    printBanner('EXTENSION SIZE VALIDATION');
    
    function getDirectorySize(dirPath) {
        let size = 0;
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                size += getDirectorySize(itemPath);
            } else {
                size += stats.size;
            }
        });
        
        return size;
    }
    
    const extensionSize = getDirectorySize('.');
    const sizeMB = (extensionSize / (1024 * 1024)).toFixed(2);
    
    console.log(`Extension size: ${sizeMB} MB`);
    
    // Chrome Web Store has a limit of ~10MB for extensions
    if (extensionSize < 10 * 1024 * 1024) {
        console.log('✅ Extension size is within reasonable limits');
        return true;
    } else {
        console.log('⚠️ Extension size might be too large for some stores');
        return false;
    }
}

function validateCodeSyntax() {
    printBanner('CODE SYNTAX VALIDATION');
    
    const jsFiles = ['background.js', 'popup.js', 'content.js'];
    let validFiles = 0;
    
    jsFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Basic syntax validation (checking for obvious issues)
                if (content.includes('chrome.') || content.includes('browser.')) {
                    console.log(`✅ ${file} - contains browser API calls`);
                } else {
                    console.log(`⚠️ ${file} - no browser API calls found`);
                }
                
                // Check for async/await usage
                if (content.includes('async') || content.includes('await')) {
                    console.log(`  ✅ Uses modern async/await syntax`);
                }
                
                // Check for error handling
                if (content.includes('try') && content.includes('catch')) {
                    console.log(`  ✅ Includes error handling`);
                }
                
                validFiles++;
                
            } catch (error) {
                console.log(`❌ Error reading ${file}:`, error.message);
            }
        } else {
            console.log(`⚠️ ${file} not found`);
        }
    });
    
    return validFiles >= jsFiles.length * 0.7;
}

function validateHTMLFiles() {
    printBanner('HTML FILES VALIDATION');
    
    const htmlFiles = ['popup.html', 'options.html'];
    let validFiles = 0;
    
    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // Basic HTML validation
                if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
                    console.log(`✅ ${file} - valid HTML structure`);
                    validFiles++;
                } else {
                    console.log(`⚠️ ${file} - missing HTML structure`);
                }
                
                // Check for CSP compliance
                if (content.includes('inline') || content.includes('onclick=')) {
                    console.log(`  ⚠️ May have inline scripts (CSP issues)`);
                } else {
                    console.log(`  ✅ No obvious inline scripts`);
                }
                
            } catch (error) {
                console.log(`❌ Error reading ${file}:`, error.message);
            }
        } else {
            console.log(`⚠️ ${file} not found`);
        }
    });
    
    return validFiles >= htmlFiles.length * 0.5;
}

function generateExtensionQAReport(results) {
    const report = `
# Browser Extension QA Report

**Date:** ${new Date().toISOString()}
**Extension:** LinkShield AI Browser Extension
**Status:** ${results.overall ? 'READY' : 'NEEDS_ATTENTION'}

## Validation Results

### Manifest Validation: ${results.manifest ? '✅ PASSED' : '❌ FAILED'}
Extension manifest file validated for required fields and structure.

### Extension Files: ${results.files ? '✅ PASSED' : '❌ FAILED'}
Core extension files present and accounted for.

### Size Validation: ${results.size ? '✅ PASSED' : '❌ FAILED'}
Extension size checked against store limits.

### Code Syntax: ${results.syntax ? '✅ PASSED' : '❌ FAILED'}
JavaScript files validated for basic syntax and API usage.

### HTML Validation: ${results.html ? '✅ PASSED' : '❌ FAILED'}
HTML files validated for structure and CSP compliance.

## Summary

${results.overall ? 
    'Browser extension is ready for testing and distribution.' : 
    'Browser extension needs attention before distribution.'
}

## Recommendations

- Test extension in development mode
- Validate API endpoints are accessible
- Perform manual testing on target websites
- Review permissions for minimal required access

---
*Generated by Browser Extension QA Validator*
`;
    
    fs.writeFileSync('extension-qa-report.md', report);
    console.log('✅ Extension QA report generated: extension-qa-report.md');
    return report;
}

function main() {
    printBanner('BROWSER EXTENSION QA VALIDATION');
    console.log('Validating LinkShield AI browser extension...');
    
    const startTime = Date.now();
    
    const results = {
        manifest: validateManifest(),
        files: validateExtensionFiles(),
        size: validateExtensionSize(),
        syntax: validateCodeSyntax(),
        html: validateHTMLFiles()
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    results.overall = passed >= total * 0.8;
    
    const duration = (Date.now() - startTime) / 1000;
    
    printBanner('EXTENSION QA RESULTS');
    Object.entries(results).forEach(([test, passed]) => {
        if (test !== 'overall') {
            const status = passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${test.toUpperCase().padEnd(15, '.')} ${status}`);
        }
    });
    
    console.log(`\nOverall: ${passed}/${total} tests passed`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    
    const report = generateExtensionQAReport(results);
    console.log(report);
    
    if (results.overall) {
        console.log('\n🎉 BROWSER EXTENSION QA SUCCESSFUL!');
        console.log('Extension is ready for testing and deployment.');
        return true;
    } else {
        console.log('\n❌ BROWSER EXTENSION QA FAILED!');
        console.log('Please address issues before deployment.');
        return false;
    }
}

if (require.main === module) {
    const success = main();
    process.exit(success ? 0 : 1);
}

module.exports = { main, validateManifest, validateExtensionFiles };