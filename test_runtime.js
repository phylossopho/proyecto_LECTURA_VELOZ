const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const indexPath = path.resolve(__dirname, 'index.html');
const jsdomErrors = [];
const virtualConsole = new VirtualConsole();

virtualConsole.on('jsdomError', function(error) {
    jsdomErrors.push(error);
});

console.log('Starting...');

async function main() {
    const dom = await JSDOM.fromFile(indexPath, {
        pretendToBeVisual: true,
        resources: 'usable',
        runScripts: 'dangerously',
        virtualConsole: virtualConsole
    });

    console.log('DOM created');

    const { window } = dom;

    await new Promise(function(resolve) {
        if (window.document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve, { once: true });
        }
    });

    const wordDisplay = window.document.getElementById('word-display');
    const startReading = window.startReading;

    console.log('word-display:', wordDisplay ? 'found' : 'NOT found');
    console.log('startReading:', typeof startReading === 'function' ? 'found' : 'NOT found');

    if (!wordDisplay || typeof startReading !== 'function' || jsdomErrors.length > 0) {
        for (var i = 0; i < jsdomErrors.length; i++) {
            console.log('WINDOW ERROR:', jsdomErrors[i].message);
        }
        process.exitCode = 1;
    }

    window.close();
}

main().catch(function(error) {
    console.log('FATAL:', error.constructor.name, error.message);
    if (error.stack) console.log(error.stack.substring(0, 500));
    process.exitCode = 1;
});
