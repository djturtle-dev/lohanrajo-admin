const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function fixFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        // Fix bg-brand-accent text-brand-text -> bg-brand-accent text-white
        if (lines[i].includes('bg-brand-accent') && lines[i].includes('text-brand-text')) {
            // we should be careful to only replace text-brand-text in the className that also has bg-brand-accent
            // A simple regex might be too broad if there are multiple classNames on one line, but usually there's only one.
            lines[i] = lines[i].replace(/bg-brand-accent\b([^\"]*?)\btext-brand-text\b/g, 'bg-brand-accent$1text-white');
            lines[i] = lines[i].replace(/\btext-brand-text\b([^\"]*?)\bbg-brand-accent\b/g, 'text-white$1bg-brand-accent');
        }

        // Fix not-found.tsx specifically
        if (filePath.endsWith('not-found.tsx') && lines[i].includes('bg-brand-text') && lines[i].includes('text-brand-text')) {
             lines[i] = lines[i].replace('text-brand-text', 'text-brand-bg');
        }
    }
    content = lines.join('\n');
    
    if (content !== original) {
        console.log('Fixed', filePath);
        fs.writeFileSync(filePath, content);
    }
}

['app', 'components'].forEach(dir => {
    walkDir(path.join(process.cwd(), dir), fixFile);
});
console.log('Done');
