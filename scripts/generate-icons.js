#!/usr/bin/env node
/**
 * Generates icon-192.png and icon-512.png in /public
 * Run once: node scripts/generate-icons.js
 * Requires: npm install --save-dev sharp
 */
const fs = require('fs');
const path = require('path');

const svgSource = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));

async function generate() {
  try {
    const sharp = require('sharp');
    for (const size of [192, 512]) {
      await sharp(svgSource)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `../public/icon-${size}.png`));
      console.log(`Created icon-${size}.png`);
    }
  } catch (e) {
    console.error('sharp not available. Installing...');
    console.log('Run: npm install --save-dev sharp && node scripts/generate-icons.js');
  }
}

generate();
