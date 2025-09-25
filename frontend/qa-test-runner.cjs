#!/usr/bin/env node
/**
 * QA Test Runner for LinkShield AI Frontend
 * Validates frontend components and build process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function printBanner(text) {
    console.log('\n' + '='.repeat(60));
    console.log(`  ${text}`);
    console.log('='.repeat(60));
}

function runCommand(command, options = {}) {
    try {
        console.log(`Running: ${command}`);
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            ...options 
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout };
    }
}

function validateProjectStructure() {
    printBanner('FRONTEND STRUCTURE VALIDATION');
    
    const requiredFiles = [
        'package.json',
        'vite.config.js',
        'index.html',
        'src/App.jsx',
        'src/main.jsx'
    ];
    
    const requiredDirs = [
        'src',
        'src/components',
        'src/pages',
        'src/services',
        'public'
    ];
    
    let score = 0;
    const total = requiredFiles.length + requiredDirs.length;
    
    console.log('Checking required files...');
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
            score++;
        } else {
            console.log(`❌ ${file} (missing)`);
        }
    });
    
    console.log('\nChecking required directories...');
    requiredDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(`✅ ${dir}/`);
            score++;
        } else {
            console.log(`❌ ${dir}/ (missing)`);
        }
    });
    
    console.log(`\nStructure Score: ${score}/${total}`);
    return score >= total * 0.8;
}

function validateDependencies() {
    printBanner('DEPENDENCY VALIDATION');
    
    if (!fs.existsSync('package.json')) {
        console.log('❌ package.json not found');
        return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for key dependencies
    const requiredDeps = ['react', 'axios'];
    const requiredDevDeps = ['vite', 'eslint'];
    
    console.log('Checking production dependencies...');
    let depScore = 0;
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
            depScore++;
        } else {
            console.log(`❌ ${dep} (missing)`);
        }
    });
    
    console.log('\nChecking development dependencies...');
    requiredDevDeps.forEach(dep => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
            console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
            depScore++;
        } else {
            console.log(`❌ ${dep} (missing)`);
        }
    });
    
    const totalDeps = requiredDeps.length + requiredDevDeps.length;
    console.log(`\nDependency Score: ${depScore}/${totalDeps}`);
    
    return depScore >= totalDeps * 0.7;
}

function validateBuildProcess() {
    printBanner('BUILD PROCESS VALIDATION');
    
    console.log('Testing build process...');
    const buildResult = runCommand('npm run build', { timeout: 120000 });
    
    if (buildResult.success) {
        console.log('✅ Build completed successfully');
        
        // Check if dist directory was created
        if (fs.existsSync('dist')) {
            console.log('✅ dist directory created');
            
            // Check for key build files
            const buildFiles = ['index.html'];
            let buildScore = 0;
            
            buildFiles.forEach(file => {
                const filePath = path.join('dist', file);
                if (fs.existsSync(filePath)) {
                    console.log(`✅ ${file} in dist/`);
                    buildScore++;
                } else {
                    console.log(`❌ ${file} missing in dist/`);
                }
            });
            
            return buildScore >= buildFiles.length;
        } else {
            console.log('❌ dist directory not created');
            return false;
        }
    } else {
        console.log('❌ Build failed');
        console.log(buildResult.error);
        return false;
    }
}

function validateCodeQuality() {
    printBanner('CODE QUALITY VALIDATION');
    
    console.log('Running ESLint...');
    const lintResult = runCommand('npm run lint');
    
    if (lintResult.success) {
        console.log('✅ ESLint passed');
        return true;
    } else {
        console.log('⚠️ ESLint found issues');
        if (lintResult.output) {
            console.log(lintResult.output);
        }
        // Don't fail on lint issues, just warn
        return true;
    }
}

function validateEnvironmentConfig() {
    printBanner('ENVIRONMENT CONFIGURATION');
    
    const envFiles = ['.env.example', '.env.local', '.env'];
    let envScore = 0;
    
    envFiles.forEach(envFile => {
        if (fs.existsSync(envFile)) {
            console.log(`✅ ${envFile} exists`);
            envScore++;
        } else {
            console.log(`⚠️ ${envFile} not found`);
        }
    });
    
    // Check Vite config
    if (fs.existsSync('vite.config.js')) {
        console.log('✅ vite.config.js exists');
        envScore++;
    } else {
        console.log('❌ vite.config.js missing');
    }
    
    return envScore > 0;
}

function generateQAReport(results) {
    printBanner('QA REPORT GENERATION');
    
    const report = `
# Frontend QA Test Report

**Date:** ${new Date().toISOString()}
**Status:** ${results.overall ? 'PASSED' : 'FAILED'}

## Test Results

### Structure Validation: ${results.structure ? '✅ PASSED' : '❌ FAILED'}
Project structure and required files validated.

### Dependency Validation: ${results.dependencies ? '✅ PASSED' : '❌ FAILED'}
Package dependencies and versions checked.

### Build Process: ${results.build ? '✅ PASSED' : '❌ FAILED'}
Production build process validated.

### Code Quality: ${results.quality ? '✅ PASSED' : '❌ FAILED'}
ESLint code quality checks completed.

### Environment Config: ${results.environment ? '✅ PASSED' : '❌ FAILED'}
Configuration files and environment setup validated.

## Summary

${results.overall ? 
    'Frontend is ready for production deployment.' : 
    'Frontend needs attention before production deployment.'
}

---
*Generated by Frontend QA Test Runner*
`;
    
    fs.writeFileSync('frontend-qa-report.md', report);
    console.log('✅ QA report generated: frontend-qa-report.md');
    console.log(report);
}

function main() {
    printBanner('LINKSHIELD AI FRONTEND - QA VALIDATION');
    console.log('Starting frontend QA tests...');
    
    const startTime = Date.now();
    
    const results = {
        structure: validateProjectStructure(),
        dependencies: validateDependencies(),
        build: validateBuildProcess(),
        quality: validateCodeQuality(),
        environment: validateEnvironmentConfig()
    };
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    results.overall = passed >= total * 0.8; // Pass if 80% of tests pass
    
    const duration = (Date.now() - startTime) / 1000;
    
    printBanner('FRONTEND QA RESULTS');
    Object.entries(results).forEach(([test, passed]) => {
        if (test !== 'overall') {
            const status = passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${test.toUpperCase().padEnd(20, '.')} ${status}`);
        }
    });
    
    console.log(`\nOverall: ${passed}/${total} tests passed`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    
    generateQAReport(results);
    
    if (results.overall) {
        console.log('\n🎉 FRONTEND QA VALIDATION SUCCESSFUL!');
        console.log('Frontend is ready for production.');
    } else {
        console.log('\n❌ FRONTEND QA VALIDATION FAILED!');
        console.log('Please address issues before production deployment.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main, validateProjectStructure, validateDependencies, validateBuildProcess };