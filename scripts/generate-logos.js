#!/usr/bin/env node

/**
 * Logo Generation Script for Astradio
 * 
 * This script generates different logo sizes from the base SVG
 * for use in app stores and web applications.
 */

const fs = require('fs');
const path = require('path');

// Logo specifications
const LOGO_SPECS = {
  // iOS App Store
  'ios/app-icon-1024.png': { width: 1024, height: 1024 },
  'ios/app-store-icon-512.png': { width: 512, height: 512 },
  
  // Android Play Store
  'android/app-icon-512.png': { width: 512, height: 512 },
  'android/feature-graphic-1024x500.png': { width: 1024, height: 500 },
  
  // Web App
  'web/favicon-32.ico': { width: 32, height: 32 },
  'web/apple-touch-icon-180.png': { width: 180, height: 180 },
  'web/pwa-icon-512.png': { width: 512, height: 512 },
  
  // Additional sizes
  'web/favicon-16.png': { width: 16, height: 16 },
  'web/favicon-32.png': { width: 32, height: 32 },
  'web/favicon-48.png': { width: 48, height: 48 },
  'web/favicon-96.png': { width: 96, height: 96 },
  'web/favicon-128.png': { width: 128, height: 128 },
  'web/favicon-256.png': { width: 256, height: 256 },
};

// Base SVG content
const BASE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Rounded black square background -->
  <rect x="32" y="32" width="448" height="448" rx="64" fill="#000000"/>
  
  <!-- Stylized cursive "A" in white -->
  <!-- Left stroke with decorative loop at bottom-left -->
  <path d="M 160 420 Q 160 400 180 380 Q 200 360 220 340 Q 240 320 260 320 Q 280 320 300 340 Q 320 360 340 380 Q 360 400 380 420 Q 400 440 420 440 Q 440 440 460 420 Q 480 400 480 380 Q 480 360 460 340 Q 440 320 420 300 Q 400 280 380 260 Q 360 240 340 240 Q 320 240 300 260 Q 280 280 260 300 Q 240 320 220 320 Q 200 320 180 340 Q 160 360 140 380 Q 120 400 100 420 Q 80 440 60 440 Q 40 440 20 420 Q 0 400 0 380 Q 0 360 20 340 Q 40 320 60 300 Q 80 280 100 260 Q 120 240 140 240 Q 160 240 180 260 Q 200 280 220 300 Q 240 320 260 340 Q 280 360 300 380 Q 320 400 340 420 Q 360 440 380 440 Q 400 440 420 420 Q 440 400 460 380 Q 480 360 480 340 Q 480 320 460 300 Q 440 280 420 260 Q 400 240 380 240 Q 360 240 340 260 Q 320 280 300 300 Q 280 320 260 340 Q 240 360 220 360 Q 200 360 180 340 Q 160 320 140 300 Q 120 280 100 260 Q 80 240 60 240 Q 40 240 20 260 Q 0 280 0 300 Q 0 320 20 340 Q 40 360 60 380 Q 80 400 100 420 Q 120 440 140 440 Q 160 440 180 420" 
        stroke="#FFFFFF" 
        stroke-width="12" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
  
  <!-- Crossbar extending from right leg with upward flourish -->
  <path d="M 340 320 Q 360 300 380 280 Q 400 260 420 260 Q 440 260 460 280 Q 480 300 500 320 Q 520 340 520 360" 
        stroke="#FFFFFF" 
        stroke-width="8" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;

function createDirectories() {
  const dirs = [
    'public/app-store',
    'public/app-store/ios',
    'public/app-store/android', 
    'public/app-store/web'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

function generateSVG(size, filename) {
  const { width, height } = size;
  const svg = BASE_SVG.replace('width="512" height="512"', `width="${width}" height="${height}"`);
  
  const filepath = path.join('public/app-store', filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generated: ${filename} (${width}x${height})`);
}

function main() {
  console.log('🎨 Generating Astradio logo assets...\n');
  
  // Create directories
  createDirectories();
  
  // Generate all logo sizes
  Object.entries(LOGO_SPECS).forEach(([filename, size]) => {
    generateSVG(size, filename);
  });
  
  console.log('\n✅ All logo assets generated successfully!');
  console.log('\n📁 Files created in: public/app-store/');
  console.log('\n📋 Next steps:');
  console.log('1. Convert SVG files to PNG using an image editor');
  console.log('2. Test logos on different backgrounds');
  console.log('3. Verify accessibility compliance');
  console.log('4. Upload to app stores');
}

if (require.main === module) {
  main();
}

module.exports = { LOGO_SPECS, BASE_SVG }; 