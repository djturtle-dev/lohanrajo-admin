const fs = require('fs');
const path = require('path');

const DIRS = ['app', 'components'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Font Replacements
    content = content.replace(/font-oswald/g, 'font-sans');
    content = content.replace(/font-inter/g, 'font-sans');

    // 2. Button Upgrades
    const buttonRegex = /<button\b([^>]*)className=(["'{])([^"'}]+)(["'}])([^>]*)>/g;
    content = content.replace(buttonRegex, (match, before, q1, classes, q2, after) => {
        let newClasses = classes;

        // Skip if already upgraded to glass
        if (!newClasses.includes('btn-glass-primary') && !newClasses.includes('btn-glass-secondary')) {
            // Apply secondary glass to everything left behind
            newClasses += ' btn-glass-secondary rounded-full font-sans text-white';
            
            // Remove legacy styling that conflicts with glass buttons
            const classesToRemove = [
                'text-brand-muted', 'text-brand-text', 'text-green-600', 'text-red-600', 'text-blue-600',
                'hover:text-brand-accent', 'hover:text-red-600', 'hover:text-blue-600', 'hover:text-brand-text',
                'hover:bg-gray-50', 'hover:bg-red-50', 'hover:bg-blue-50', 'hover:bg-green-50', 'hover:bg-[#1a1a1a]',
                'hover:bg-brand-panel', 'bg-white', 'bg-brand-panel', 'bg-transparent',
                'border-brand-border', 'border-transparent', 'shadow-sm'
            ];
            
            classesToRemove.forEach(cls => {
                newClasses = newClasses.replace(new RegExp(`\\b${cls}\\b`, 'g'), '');
            });

            // Adjust padding for small icon buttons that had p-1 or p-1.5
            if (newClasses.includes('p-1.5') || newClasses.includes('p-1') || newClasses.includes('p-2')) {
                newClasses = newClasses.replace(/\bp-1\.5\b/g, 'p-2');
                newClasses = newClasses.replace(/\bp-1\b/g, 'p-2');
                if (!newClasses.includes('p-2')) newClasses += ' p-2';
            } else {
                // Ensure some default padding if none exists and it's not a primary button
                if (!newClasses.includes('px-') && !newClasses.includes('py-')) {
                    newClasses += ' px-4 py-2 text-xs uppercase tracking-widest';
                }
            }
        }

        // Clean up whitespace
        newClasses = [...new Set(newClasses.split(/\s+/))].filter(Boolean).join(' ');
        
        return `<button${before}className=${q1}${newClasses}${q2}${after}>`;
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
console.log('Done upgrading fonts and remaining buttons.');
