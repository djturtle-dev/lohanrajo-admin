const fs = require('fs');
const path = require('path');

const DIRS = ['app', 'components'];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('bg-white')) {
                content = content.replace(/bg-white/g, 'bg-brand-panel');
                modified = true;
            }
            if (content.includes('bg-brand-light')) {
                content = content.replace(/bg-brand-light/g, 'bg-[#1a1a1a]');
                modified = true;
            }
            // Update messages specific hardcodes
            if (content.includes('bg-[#0a0a0a]')) {
                content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-brand-bg');
                modified = true;
            }
            if (content.includes('bg-[#1d1d1d]')) {
                content = content.replace(/bg-\[#1d1d1d\]/g, 'bg-brand-panel');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

DIRS.forEach(processDir);
console.log('Done replacing theme classes.');
