const fs = require('fs');
const https = require('https');

const files = [
  { name: 'features', path: '.system_generated/steps/285/output.txt' },
  { name: 'how-it-works', path: '.system_generated/steps/286/output.txt' },
  { name: 'pricing', path: '.system_generated/steps/287/output.txt' },
  { name: 'about', path: '.system_generated/steps/288/output.txt' },
  { name: 'contact', path: '.system_generated/steps/289/output.txt' }
];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function convertToJsx(html) {
  let jsx = html.replace(/class=/g, 'className=')
                .replace(/for=/g, 'htmlFor=')
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/<img([^>]+[^\/])>/g, '<img$1 />')
                .replace(/<input([^>]+[^\/])>/g, '<input$1 />')
                .replace(/<br>/g, '<br />')
                .replace(/<hr>/g, '<hr />');
  
  jsx = jsx.replace(/style="([^"]+)"/g, '');
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=')
           .replace(/stroke-linecap=/g, 'strokeLinecap=')
           .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
           .replace(/fill-rule=/g, 'fillRule=')
           .replace(/clip-rule=/g, 'clipRule=');
           
  return `export default function Page() {\n  return (\n    <>\n${jsx}\n    </>\n  );\n}`;
}

async function processAll() {
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync('C:/Users/pawan/.gemini/antigravity-ide/brain/a7c2bae0-3ad5-4118-9016-2b3311ce1ae9/' + file.path, 'utf8'));
      const url = data.outputComponents[0].design.screens[0].htmlCode.downloadUrl;
      const html = await download(url);
      
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyHtml = bodyMatch ? bodyMatch[1] : html;
      
      const jsx = convertToJsx(bodyHtml);
      
      const dir = 'C:/Users/pawan/OneDrive/Documents/ALL_NEW_PROJECTS/medi/app/(public)/' + file.name;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dir + '/page.tsx', jsx);
      console.log('Saved ' + file.name);
    } catch (e) {
      console.error('Failed on ' + file.name, e);
    }
  }
}

processAll();
