const fs = require('fs');
const path = require('path');

// Default target directory relative to gbt folder
const defaultTargetDir = '../../backend/rust-gbt/';
const targetDir = process.env.FD || defaultTargetDir;
const fullTargetPath = path.resolve(__dirname, targetDir);

try {
    // Remove existing directory if it exists
    if (fs.existsSync(fullTargetPath)) {
        fs.rmSync(fullTargetPath, { recursive: true, force: true });
    }

    // Create the target directory
    fs.mkdirSync(fullTargetPath, { recursive: true });

    // Files to copy
    const filesToCopy = ['index.js', 'index.d.ts', 'package.json'];

    // Copy the specified files
    filesToCopy.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(fullTargetPath, file));
        }
    });

    // Copy .node files
    fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.node'))
        .forEach(file => {
            fs.copyFileSync(file, path.join(fullTargetPath, file));
        });

    console.log('Files successfully copied to', fullTargetPath);
} catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
}
