// Simple script to generate placeholder icons
const fs = require('fs');
const path = require('path');

// Create a simple PNG data for each size
// These are minimal 1x1 pixel PNGs with our brand colors
const createSimplePNG = (color) => {
  // Base64 encoded 1x1 pixel PNG - we'll scale with CSS
  const pngData = {
    red: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    blue: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwABWgD/W7qCUgAAAABJRU5ErkJggg==',
    green: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };
  return Buffer.from(pngData[color] || pngData.blue, 'base64');
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Generate simple colored PNG files
const bluePNG = createSimplePNG('blue');

fs.writeFileSync(path.join(iconsDir, 'icon16.png'), bluePNG);
fs.writeFileSync(path.join(iconsDir, 'icon32.png'), bluePNG);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), bluePNG);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), bluePNG);

console.log('Generated placeholder PNG icons!');
