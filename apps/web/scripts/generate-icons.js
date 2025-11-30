/**
 * Script to generate PWA icons from a source image
 * 
 * Usage:
 * 1. Place a 512x512 or larger PNG image at apps/web/public/icon-source.png
 * 2. Run: node apps/web/scripts/generate-icons.js
 * 
 * Or use an online tool like https://realfavicongenerator.net/
 */

const fs = require('fs');
const path = require('path');

const sizes = [57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512];
const publicDir = path.join(__dirname, '../public');

console.log('PWA Icon Generator');
console.log('==================');
console.log('');
console.log('Required icon sizes:', sizes.join(', '));
console.log('');
console.log('To generate icons:');
console.log('1. Use an online tool like https://realfavicongenerator.net/');
console.log('   or https://www.pwabuilder.com/imageGenerator');
console.log('2. Upload a 512x512 or larger PNG image');
console.log('3. Download all sizes and place them in apps/web/public/');
console.log('');
console.log('Or create a simple placeholder script if needed.');
console.log('');
console.log('Current icon files in public/:');
const files = fs.readdirSync(publicDir).filter(f => f.startsWith('icon-') && f.endsWith('.png'));
if (files.length > 0) {
  files.forEach(f => console.log(`  ✓ ${f}`));
} else {
  console.log('  No icon files found');
}
console.log('');
console.log('Missing sizes:');
sizes.forEach(size => {
  const filename = `icon-${size}.png`;
  if (!files.includes(filename)) {
    console.log(`  ✗ ${filename}`);
  }
});

