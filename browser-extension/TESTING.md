# Testing the LinkShield AI Browser Extension

## ✅ Prerequisites Met
- ✅ PNG icon files created automatically
- ✅ Backend running on http://localhost:8000
- ✅ All extension files ready

## 🚀 Load Extension in Chrome

1. **Open Chrome** and go to: `chrome://extensions/`

2. **Enable Developer Mode** (toggle in top-right corner)

3. **Load Extension**:
   - Click "Load unpacked"
   - Navigate to: `D:\Projects\linkshield-ai\browser-extension`
   - Select the folder and click "Select Folder"

4. **Verify Installation**:
   - LinkShield AI icon should appear in toolbar
   - If not visible, click the puzzle piece icon and pin LinkShield AI
```bash
cd backend
# If you haven't installed dependencies:
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Verify API is Working
Open your browser and visit: http://localhost:8000/docs
You should see the FastAPI documentation.

### 3. Test API Endpoint
Try this curl command to test the predict endpoint:
```bash
curl -X POST "http://localhost:8000/api/v1/predict/" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 4. Load the Extension

#### Create Icon Files First
You need to create PNG icon files before loading the extension:

**Quick Solution**: Download any 16x16, 32x32, 48x48, and 128x128 pixel PNG images and rename them:
- Save as `browser-extension/icons/icon16.png`
- Save as `browser-extension/icons/icon32.png`  
- Save as `browser-extension/icons/icon48.png`
- Save as `browser-extension/icons/icon128.png`

#### Load in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Navigate to and select the `browser-extension` folder
6. The LinkShield AI extension should now appear in your toolbar

### 5. Test the Extension

#### Automatic Testing
1. Visit any website (e.g., https://github.com)
2. Check the extension icon - it should show a badge or status
3. Click the LinkShield icon to see scan results

#### Manual Testing
1. Click the LinkShield extension icon
2. Should show popup with current page scan results
3. Try the "Rescan" button
4. Try the "Details" button for detailed analysis

#### Test with Suspicious URLs
Try visiting these test URLs to see warnings:
- http://malware.testing.google.test/testing/malware/
- http://testsafebrowsing.appspot.com/s/phishing.html

### 6. Troubleshooting

#### Extension Won't Load
- Make sure all icon PNG files exist in `browser-extension/icons/`
- Check Chrome console: F12 → Console tab
- Look for error messages in chrome://extensions/

#### No API Connection
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Test API manually with curl

#### No Scan Results
- Check that URLs are being sent to API
- Look at Network tab in Chrome DevTools
- Verify API responses are successful

### 7. Development Tips

#### Debug the Extension
1. Go to chrome://extensions/
2. Find LinkShield AI extension
3. Click "Inspect views: background page"
4. This opens DevTools for the extension's background script

#### View Console Logs
- Background script logs: Extensions → Inspect views → background page
- Content script logs: Regular page F12 → Console
- Popup logs: Right-click extension icon → Inspect popup

#### Test Different Scenarios
- Test with/without internet connection
- Test with API server stopped
- Test on different types of websites
- Test the settings/options page

## Expected Behavior

### Safe Websites
- Green badge or no badge
- Popup shows "Safe" status
- No warnings displayed

### Suspicious Websites  
- Yellow/orange badge
- Warning banner at top of page
- Popup shows "Suspicious" with confidence score

### Malicious Websites
- Red badge  
- Strong warning banner
- Popup shows "Malicious" with high confidence
- Links may be blocked (configurable)

### Error Cases
- Gray badge for unknown/error status
- Error messages in popup
- Graceful fallback when API unavailable

## Next Steps

Once you've tested the basic functionality:

1. **Customize Settings**: Visit the Options page via popup
2. **Test with Real Phishing URLs**: Use PhishTank database for testing
3. **Performance Testing**: Check extension impact on browsing speed
4. **Cross-browser Testing**: Test on different Chrome versions
5. **Production Setup**: Configure for production API endpoints

The extension is now a powerful addition to your LinkShield AI project, providing real-time protection directly in the browser!
