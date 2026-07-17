const fs = require('fs');
const path = require('path');

// Append to globals.css
const cssPath = path.join('app', 'globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.nav-text')) {
    cssContent += `\n\n.nav-text {\n  font-family: var(--font-oswald), 'Oswald', sans-serif;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n}\n`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('Appended .nav-text to globals.css');
}

const DIRS = ['app', 'components'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We want to replace h1 and h2 classNames
    const headerRegex = /<(h1|h2)\b([^>]*)className=(["'{])([^"'}]+)(["'}])([^>]*)>/g;
    content = content.replace(headerRegex, (match, tag, before, q1, classes, q2, after) => {
        let newClasses = classes;
        
        // Add nav-text
        if (!newClasses.includes('nav-text')) {
            newClasses += ' nav-text';
        }
        
        // Remove redundant tailwind classes
        const classesToRemove = ['font-sans', 'font-bold', 'uppercase', 'tracking-widest', 'tracking-tighter', 'tracking-wider'];
        classesToRemove.forEach(cls => {
            newClasses = newClasses.replace(new RegExp(`\\b${cls}\\b`, 'g'), '');
        });

        newClasses = [...new Set(newClasses.split(/\s+/))].filter(Boolean).join(' ');
        
        return `<${tag}${before}className=${q1}${newClasses}${q2}${after}>`;
    });

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
console.log('Done upgrading headers.');
