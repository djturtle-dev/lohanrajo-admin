const fs = require('fs');
const path = require('path');

const DIRS = ['app', 'components'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Split into lines for easier processing, though multiline tags exist, 
    // className usually sits on the same line or we can do regex.
    // Let's use regex on the whole content.

    // 1. Inputs and Selects
    const inputRegex = /<(input|select)\b([^>]*)className=(["'{])([^"'}]+)(["'}])([^>]*)>/g;
    content = content.replace(inputRegex, (match, tag, before, q1, classes, q2, after) => {
        let newClasses = classes;
        newClasses = newClasses.replace(/bg-\[#1a1a1a\]/g, 'bg-[#1d1d1d]');
        newClasses = newClasses.replace(/bg-brand-panel/g, 'bg-[#1d1d1d]');
        newClasses = newClasses.replace(/font-inter/g, 'font-sans');
        newClasses = newClasses.replace(/font-oswald/g, 'font-sans');
        
        if (!newClasses.includes('rounded-full') && tag !== 'input[type="radio"]' && tag !== 'input[type="checkbox"]') {
            // only apply to text/email/file inputs, etc.
            if (!match.includes('type="radio"') && !match.includes('type="hidden"') && !match.includes('type="checkbox"')) {
                newClasses += ' rounded-full';
            }
        }
        if (!newClasses.includes('placeholder-brand-muted/40')) {
            newClasses += ' placeholder-brand-muted/40';
        }
        
        // Remove duplicates if any
        newClasses = [...new Set(newClasses.split(/\s+/))].join(' ');
        
        return `<${tag}${before}className=${q1}${newClasses}${q2}${after}>`;
    });

    // 2. Textareas
    const textareaRegex = /<textarea\b([^>]*)className=(["'{])([^"'}]+)(["'}])([^>]*)>/g;
    content = content.replace(textareaRegex, (match, before, q1, classes, q2, after) => {
        let newClasses = classes;
        newClasses = newClasses.replace(/bg-\[#1a1a1a\]/g, 'bg-[#1d1d1d]');
        newClasses = newClasses.replace(/bg-brand-panel/g, 'bg-[#1d1d1d]');
        newClasses = newClasses.replace(/font-inter/g, 'font-sans');
        newClasses = newClasses.replace(/font-oswald/g, 'font-sans');
        
        if (!newClasses.includes('rounded-2xl')) {
            newClasses += ' rounded-2xl';
        }
        if (!newClasses.includes('placeholder-brand-muted/40')) {
            newClasses += ' placeholder-brand-muted/40';
        }
        
        newClasses = [...new Set(newClasses.split(/\s+/))].join(' ');
        
        return `<textarea${before}className=${q1}${newClasses}${q2}${after}>`;
    });

    // 3. Buttons
    const buttonRegex = /<button\b([^>]*)className=(["'{])([^"'}]+)(["'}])([^>]*)>/g;
    content = content.replace(buttonRegex, (match, before, q1, classes, q2, after) => {
        let newClasses = classes;
        // Primary buttons
        if (newClasses.includes('bg-brand-accent') && newClasses.includes('text-white')) {
            newClasses = newClasses.replace(/bg-brand-accent/g, 'btn-glass-primary');
            newClasses = newClasses.replace(/hover:bg-red-700/g, '');
            newClasses = newClasses.replace(/hover:bg-brand-dark/g, '');
            newClasses = newClasses.replace(/transition-colors/g, '');
            newClasses = newClasses.replace(/border border-brand-accent/g, '');
            if (!newClasses.includes('rounded-full')) newClasses += ' rounded-full';
            if (!newClasses.includes('font-sans')) newClasses += ' font-sans';
        }
        // Secondary buttons
        else if ((newClasses.includes('bg-[#1a1a1a]') || newClasses.includes('bg-brand-panel')) && newClasses.includes('border-brand-border') && !newClasses.includes('p-1.5')) {
            newClasses = newClasses.replace(/bg-\[#1a1a1a\]/g, 'btn-glass-secondary');
            newClasses = newClasses.replace(/bg-brand-panel/g, 'btn-glass-secondary');
            newClasses = newClasses.replace(/hover:bg-gray-50/g, '');
            newClasses = newClasses.replace(/hover:bg-brand-border/g, '');
            if (!newClasses.includes('rounded-full')) newClasses += ' rounded-full';
            if (!newClasses.includes('font-sans')) newClasses += ' font-sans';
        }

        // Clean up text sizes/fonts if they were upgraded
        if (newClasses.includes('btn-glass')) {
            newClasses = newClasses.replace(/font-inter/g, '');
            newClasses = newClasses.replace(/font-oswald/g, '');
            newClasses = newClasses.replace(/text-white/g, '');
        }

        newClasses = [...new Set(newClasses.split(/\s+/))].filter(Boolean).join(' ');
        return `<button${before}className=${q1}${newClasses}${q2}${after}>`;
    });

    if (content !== fs.readFileSync(filePath, 'utf8')) {
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
console.log('Done upgrading forms and buttons.');
