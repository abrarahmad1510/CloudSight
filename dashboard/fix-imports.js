const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src/components/ui');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remove version numbers from @radix-ui imports
  content = content.replace(
    /from "@radix-ui\/([^@"]+)@[^"]+"/g,
    'from "@radix-ui/$1"'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in: ${path.basename(filePath)}`);
  }
}

// Read all files in the UI directory
const files = fs.readdirSync(uiDir);
console.log(`📁 Found ${files.length} files to check...`);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    fixImportsInFile(path.join(uiDir, file));
  }
});

console.log('🎉 All imports fixed! Now installing dependencies...');
