import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('assets',{recursive:true});
await sharp('assets/icon.svg').resize(1024,1024).png().toFile('assets/icon.png');
await sharp('assets/wordmark.svg').resize({width:500}).png().toFile('assets/wordmark.png');
await sharp('assets/icon.svg').resize(400,400).png().toFile('assets/notification-icon.png');
console.log('JOY VIMO approved-inspired icon and wordmark rasterized.');
