const fs = require('fs');
const path = require('path');

const files = [
  'features/page.tsx',
  'how-it-works/page.tsx',
  'pricing/page.tsx',
  'about/page.tsx',
  'contact/page.tsx'
];

files.forEach(f => {
  const fullPath = path.join('C:/Users/pawan/OneDrive/Documents/ALL_NEW_PROJECTS/medi/app/(public)', f);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix style tags to be JSX compatible
  let newContent = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function(match, p1) {
    // Escape backticks and ${} if they exist in the CSS
    const escapedCSS = p1.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
    return "<style dangerouslySetInnerHTML={{ __html: `" + escapedCSS + "` }} />";
  });
  
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent);
    console.log('Fixed styles in', f);
  } else {
    console.log('No styles to fix in', f);
  }
});
