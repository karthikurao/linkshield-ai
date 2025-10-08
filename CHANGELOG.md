# Changelog

All notable changes to the LinkShield AI project will be documented in this file.

## [2.1.0] - 2025-10-08

### 🎯 Added
- **Enhanced Phishing Detection**: Rule-based sensitivity adjustments that work alongside ML model
- **Post-Processing Override System**: Intelligent analysis that can override ML predictions
- **Aggressive Pattern Detection**: 20+ phishing indicators with weighted scoring
- **Brand Impersonation Detection**: Identifies fake domains impersonating major brands
- **Typosquatting Detection**: Catches common misspellings of popular sites
- **Detailed Security Alerts**: Visual indicators (🚨🔴⚠️) for threat levels

### 🔧 Changed
- **Model Version**: Updated to "linkshield-bert-v1.0-enhanced"
- **Fallback Thresholds**: More aggressive classification (40/60 instead of 30/70)
- **Keyword Penalties**: Increased from 5 to 8 points for suspicious keywords
- **Suspicious Keywords Impact**: Upgraded from "medium" to "high" priority
- **Override Messages**: Now shows ML prediction vs adjusted classification

### 🐛 Fixed
- **False Negatives**: Significantly reduced missed phishing URLs
- **Benign Bias**: Model now catches obvious phishing patterns it previously missed
- **IP-based URLs**: Now correctly flagged as high-risk (critical indicator)
- **Suspicious TLDs**: Enhanced detection of commonly abused TLDs

### 🔒 Security
- **Multi-Layer Defense**: ML model + rule-based validation
- **Explainable AI**: Clear reasons for every security decision
- **High-Risk Keyword Detection**: 20+ phishing-related terms
- **Protocol Validation**: Flags insecure HTTP connections
- **Domain Analysis**: Enhanced brand impersonation checks

### 📊 Performance
- **No Latency Impact**: Rule-based checks run in milliseconds
- **No Model Changes**: Works without retraining or model access
- **Tunable Thresholds**: Easy adjustment without code changes
- **Complementary Design**: Enhances rather than replaces ML

## [2.0.0] - 2025-08-13

### 🚀 Added
- **Browser Extension Integration**: Complete Chrome/Firefox extension with real-time URL scanning
- **Guest Access Support**: No authentication required for basic URL scanning
- **Real-Time Protection**: Instant phishing detection on every page navigation
- **Visual Safety Indicators**: Badge updates and link highlighting for threat status
- **Warning Pages**: Full-page warnings for malicious sites
- **Smart Caching**: 5-minute TTL caching for improved performance
- **Fallback Analysis**: Comprehensive link scanning for enhanced protection

### 🔧 Changed
- **API Authentication**: Made authentication optional for predict/analyze endpoints
- **Error Handling**: Improved error responses for unauthenticated requests
- **Performance**: Optimized scanning with intelligent caching and batching

### 🐛 Fixed
- **401 Authentication Errors**: Resolved extension authentication issues
- **Real-Time Scanning**: Fixed navigation listeners for immediate URL analysis
- **Badge Updates**: Corrected timing for visual feedback
- **Network Failures**: Enhanced error handling for API timeouts

### 🔒 Security
- **Maintained Authentication**: User-specific features still require proper auth
- **Guest Protection**: Basic scanning available to all users
- **API Security**: Proper validation for all endpoints

## [1.0.1] - 2025-06-08

### Added
- Fallback prediction mechanism when ML model files are missing
- Enhanced health endpoint with detailed model status information
- Test script to verify the fallback functionality (`backend/test_fallback.py`)
- Documentation for fallback mechanism (`docs/fallback_mechanism.md`)

### Fixed
- Application now gracefully handles missing ML model files
- Fixed DynamoDB scan history storage format
- Fixed indentation issues in URL analysis code

## [1.0.0] - 2025-06-08

### Added
- Complete AWS Amplify authentication system
- User profiles with AWS Cognito integration
- Real-time URL scanning with ML-based detection
- Threat intelligence dashboard
- Community protection features
- Phishing simulator tool
- URL risk visualizer
- Dark/light mode theme support
- Comprehensive documentation

### Changed
- Optimized repository structure and size
- Improved error handling in API services
- Enhanced security with proper token management
- Updated all dependencies to latest versions

### Removed
- Custom authentication in favor of AWS Amplify
- Mock authentication pages and components
- Temporary development files
- Large dataset files (replaced with samples)

## [0.9.0] - 2025-05-15

### Added
- Initial beta release
- Basic URL scanning functionality
- Preliminary ML model integration
- Frontend UI components
- Backend API structure
