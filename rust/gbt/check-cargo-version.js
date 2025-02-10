const fs = require('fs');
const { execSync } = require('child_process');

try {
    const rustToolchain = fs.readFileSync('./rust-toolchain', 'utf8').trim();
    const cargoVersion = execSync('cargo --version', { encoding: 'utf8' });
    
    if (!cargoVersion.includes(`cargo ${rustToolchain}`)) {
        console.warn(`\x1b[1;35m[[[[WARNING]]]]: cargo version mismatch with ./rust-toolchain version (${rustToolchain})!!!\x1b[0m`);
    }
} catch (error) {
    console.warn('Failed to check cargo version:', error);
    // Exit with success code to not break the build
    process.exit(0);
}
