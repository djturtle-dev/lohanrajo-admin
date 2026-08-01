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
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (filePath.endsWith('globals.css')) {
        content = content.replace(/\.btn-glass-secondary \{\s*@apply[^;]+;/g, (match) => {
            return match.replace('text-brand-text', 'text-white');
        });
        content = content.replace(/\.nav-glass \{\s*@apply[^;]+;/g, (match) => {
            return match.replace('text-brand-text', 'text-white');
        });
    } else {
        // Find className containing btn-glass-secondary or nav-glass and remove text-brand-text
        let lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('btn-glass-secondary') || lines[i].includes('nav-glass')) {
                lines[i] = lines[i].replace(/\btext-brand-text\b/g, '').replace(/\s{2,}/g, ' ');
            }
        }
        content = lines.join('\n');
    }
    
    if (content !== original) {
        console.log('Fixed', filePath);
        fs.writeFileSync(filePath, content);
    }
}

['app', 'components'].forEach(dir => {
    walkDir(path.join(process.cwd(), dir), fixFile);
});
console.log('Done');
