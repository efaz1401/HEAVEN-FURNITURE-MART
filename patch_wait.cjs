const fs = require('fs');
const file = 'C:/Users/MSI/AppData/Roaming/npm/node_modules/chrome-devtools-mcp/build/src/WaitForHelper.js';
let content = fs.readFileSync(file, 'utf8');
const target = '            await this.waitForStableDom();';
const replacement = '            // bypassed waitForStableDom for live SPAs\n            // await this.waitForStableDom();';
if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Successfully patched WaitForHelper.js!');
} else {
    console.log('Target not found in WaitForHelper.js');
}
