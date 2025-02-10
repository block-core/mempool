const fs = require('fs');
const path = require('path');

try {
    // Ensure dist/tasks directory exists
    const tasksDir = path.join(__dirname, '..', 'dist', 'tasks');
    fs.mkdirSync(tasksDir, { recursive: true });

    // Copy mtgox-weekly.json
    const sourceFile = path.join(__dirname, '..', 'src', 'tasks', 'price-feeds', 'mtgox-weekly.json');
    const targetFile = path.join(tasksDir, 'mtgox-weekly.json');
    fs.copyFileSync(sourceFile, targetFile);

    // Run fetch-version.js
    require('../dist/api/fetch-version.js');

    console.log('Resources created successfully');
} catch (error) {
    console.error('Error creating resources:', error);
    process.exit(1);
}
