const fs = require('fs');
const path = require('path');

// Append to globals.css
const cssPath = path.join('app', 'globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.fancy-text')) {
    cssContent += `\n\n.fancy-text {\n  font-family: var(--font-forum), 'Forum', serif;\n  font-weight: 400;\n}\n`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('Appended .fancy-text to globals.css');
}

const DIRS = ['app', 'components'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace nav-text with fancy-text
    content = content.replace(/nav-text/g, 'fancy-text');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

DIRS.forEach(processDir);
console.log('Done upgrading to fancy-text.');
