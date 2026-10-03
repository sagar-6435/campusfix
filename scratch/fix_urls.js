const fs = require('fs');
const path = require('path');

function replaceUrls(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceUrls(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:5000')) {
                // Replace all fetch/axios calls properly
                content = content.replace(/['"`]http:\/\/localhost:5000(.*?)['"`]/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}
replaceUrls('c:/My projects/campus-fix/client/src');
