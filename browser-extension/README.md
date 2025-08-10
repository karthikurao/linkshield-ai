# LinkShield AI Browser Extension

Real-time phishing protection powered by AI machine learning, integrated directly into your browser.

## 🛡️ Features

- **Real-time URL Scanning**: Automatically scans URLs as you browse
- **AI-Powered Detection**: Uses BERT-based machine learning model for accurate phishing detection
- **Visual Warnings**: Highlights suspicious links and shows warning banners
- **Smart Protection**: Blocks malicious URLs with confidence-based scoring
- **Detailed Analysis**: Provides in-depth risk factor analysis
- **Privacy-Focused**: Scans performed via your own API, no data sent to third parties
- **Lightweight**: Minimal performance impact on browsing

## 🚀 Installation

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/karthikurao/linkshield-ai.git
   cd linkshield-ai/browser-extension
   ```

2. **Start Your LinkShield AI Backend**
   - Make sure your FastAPI backend is running on `http://localhost:8000`
   - Follow the main project setup instructions

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the `browser-extension` folder
   - The LinkShield AI icon should appear in your toolbar

### Production Build

For production deployment:
1. Update the API URL in `background.js` and `popup.js`
2. Generate proper icon files (PNG format) for the `icons/` directory
3. Package the extension using Chrome Web Store Developer Dashboard

## 🔧 Configuration

### API Settings
- **Default API URL**: `http://localhost:8000`
- **Custom API**: Change in extension options or modify `background.js`
- **API Key**: Optional authentication for production APIs

### Protection Levels
- **Real-time Protection**: Scans pages as you navigate
- **Link Analysis**: Analyzes links when you hover over them
- **Auto-blocking**: Prevents navigation to malicious sites
- **Warning Banners**: Shows visual warnings on dangerous pages

## 📱 Usage

### Automatic Protection
The extension works automatically once installed:
- Scans every new page you visit
- Analyzes links on the page
- Shows warnings for suspicious content
- Blocks dangerous URLs (configurable)

### Manual Features
- **Extension Popup**: Click the LinkShield icon to see current page status
- **Detailed Analysis**: Get comprehensive risk factor breakdown
- **Settings**: Configure protection levels and notifications
- **Statistics**: View your protection statistics

### Visual Indicators
- 🟢 **Green Badge**: Site is safe
- 🟡 **Yellow Badge**: Site is suspicious  
- 🔴 **Red Badge**: Site is malicious
- **Warning Banners**: Full-page alerts for dangerous sites
- **Link Highlighting**: Suspicious links marked with warning icons

## 🛠️ Technical Architecture

### Components
- **Background Script** (`background.js`): Service worker handling API calls and navigation events
- **Content Script** (`content.js`): Injected into pages for link analysis and warnings  
- **Popup** (`popup.html/js`): Extension interface showing scan results
- **Options Page** (`options.html`): Settings and configuration panel

### API Integration
- Connects to LinkShield AI FastAPI backend
- Uses `/api/v1/predict/` for URL scanning
- Uses `/api/v1/analyze-url` for detailed analysis
- Implements caching to reduce API calls
- Handles offline/error scenarios gracefully

### Security Features
- **Manifest V3**: Latest Chrome extension security standards
- **Limited Permissions**: Only requests necessary permissions
- **Local Processing**: No data sent to external services
- **Secure Communication**: HTTPS API calls in production

## 📊 Statistics & Analytics

The extension tracks:
- Total sites scanned
- Threats blocked
- Safe sites visited
- Detection accuracy
- Response times

Access statistics via:
- Extension popup
- Options page
- Export functionality for analysis

## 🔒 Privacy & Security

### Data Protection
- **No Data Collection**: Extension doesn't collect personal data
- **Local Analysis**: All processing via your API
- **No Tracking**: No user behavior tracking
- **Secure Storage**: Settings stored locally using Chrome's secure storage

### Permissions Explained
- `activeTab`: Access current tab URL for scanning
- `storage`: Save settings and statistics
- `webNavigation`: Detect page navigation for real-time scanning
- `notifications`: Show security alerts

## 🐛 Troubleshooting

### Common Issues

**Extension Not Working**
- Ensure LinkShield AI backend is running
- Check API URL in extension settings
- Verify Chrome developer mode is enabled

**API Connection Errors**
- Confirm backend API is accessible
- Check CORS settings in FastAPI
- Verify network connectivity

**Performance Issues**
- Reduce scan frequency in settings
- Enable caching for better performance
- Update API endpoint for production deployment

### Debug Mode
1. Open Chrome DevTools
2. Go to Extensions tab
3. Click "background page" for LinkShield AI
4. View console logs for debugging

## 🚀 Development

### File Structure
```
browser-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (main logic)
├── content.js             # Page injection script
├── content.css            # Styling for warnings
├── popup.html/js          # Extension popup interface
├── options.html           # Settings page
├── icons/                 # Extension icons
└── README.md             # This file
```

### API Endpoints Used
- `POST /api/v1/predict/` - URL scanning
- `GET /api/v1/analyze-url` - Detailed analysis
- `GET /health` - API health check

### Customization
- Modify `background.js` for different scanning logic
- Update `content.js` for custom warning styles
- Customize `popup.html` for different UI
- Add new features via `manifest.json` permissions

## 📈 Future Enhancements

- **Firefox Support**: Mozilla WebExtensions compatibility
- **Safari Extension**: Safari Web Extensions support  
- **Advanced Analytics**: More detailed threat intelligence
- **Machine Learning**: Edge-based processing
- **Integration APIs**: Support for more threat intelligence feeds
- **Enterprise Features**: Admin controls and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Documentation**: See main project documentation
- **API Docs**: Visit `http://localhost:8000/docs` when backend is running

---

**Made with ❤️ for a safer web browsing experience**
