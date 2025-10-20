const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src/components/ui');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remove version numbers from ALL package imports
  content = content.replace(
    /from "([^@"]+)@[^"]+"/g,
    'from "$1"'
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

// Read all files in the UI directory
const files = fs.readdirSync(uiDir);
console.log(`�� Found ${files.length} files to check...`);

let fixedCount = 0;
files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    if (fixImportsInFile(path.join(uiDir, file))) {
      fixedCount++;
    }
  }
});

console.log(`🎉 Fixed ${fixedCount} files!`);
