# Browser Extension Setup Instructions

## Creating Icon Files

Since the extension requires PNG icons in multiple sizes, you need to create these from the SVG file:

### Option 1: Online Converter
1. Go to https://convertio.co/svg-png/
2. Upload the `icons/icon.svg` file
3. Download and rename the PNG files as:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels) 
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

### Option 2: Using ImageMagick (if installed)
```bash
cd browser-extension/icons
magick icon.svg -resize 16x16 icon16.png
magick icon.svg -resize 32x32 icon32.png
magick icon.svg -resize 48x48 icon48.png
magick icon.svg -resize 128x128 icon128.png
```

### Option 3: Use Placeholder Icons
For testing, you can temporarily use any 16x16, 32x32, 48x48, and 128x128 PNG files and rename them accordingly.

## Installation Steps

1. **Prepare Icons** (see above)

2. **Update API URL** (if needed):
   - Edit `background.js` line 4: Change `http://localhost:8000` to your API URL
   - Edit `popup.js` if using a different frontend URL

3. **Load in Chrome**:
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `browser-extension` folder
   - Extension should appear in toolbar

4. **Test the Extension**:
   - Visit a website
   - Click the LinkShield icon in toolbar
   - Should show scan results for current page

## Troubleshooting

**Extension won't load**:
- Check that all icon files exist
- Verify manifest.json syntax
- Check Chrome console for errors

**API connection fails**:
- Ensure backend is running on correct port
- Check CORS settings in FastAPI
- Verify API URL in background.js

**No scan results**:
- Check browser console (F12) for errors
- Verify API endpoints are working
- Test API manually with curl or Postman
