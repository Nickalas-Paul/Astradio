#!/usr/bin/env node

// Check Swiss Ephemeris availability and provide installation guidance

console.log('🔮 Checking Swiss Ephemeris availability...');

try {
  const swisseph = require('swisseph');
  console.log('✅ Swiss Ephemeris native module is available');
  console.log('   Version:', swisseph.version || 'unknown');
  console.log('   Functions available:', Object.keys(swisseph).filter(key => typeof swisseph[key] === 'function').length);
} catch (error) {
  console.log('⚠️  Swiss Ephemeris native module is not available');
  console.log('');
  console.log('📋 To install Swiss Ephemeris with full functionality:');
  console.log('');
  console.log('Windows:');
  console.log('   1. Install Visual Studio Build Tools 2019 or later');
  console.log('   2. Include "Desktop development with C++" workload');
  console.log('   3. Run: npm install');
  console.log('');
  console.log('macOS:');
  console.log('   1. Install Xcode Command Line Tools');
  console.log('   2. Run: npm install');
  console.log('');
  console.log('Linux:');
  console.log('   1. Install build essentials: sudo apt-get install build-essential');
  console.log('   2. Run: npm install');
  console.log('');
  console.log('💡 The application will work with simplified calculations');
  console.log('   but will not have professional-grade astrological accuracy.');
  console.log('');
}

console.log('✅ Swiss Ephemeris check completed');
