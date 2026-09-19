const { JSDOM } = require('jsdom');
const path = require('path');
const fs = require('fs');

// Read the HTML and JS files
const indexPath = path.resolve(__dirname, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

// Load all JS files in order
const modeWord = fs.readFileSync(path.resolve(__dirname, 'mode-word.js'), 'utf8');
const modeChunk = fs.readFileSync(path.resolve(__dirname, 'mode-chunk.js'), 'utf8');
const modeLine = fs.readFileSync(path.resolve(__dirname, 'mode-line.js'), 'utf8');
const modeStarWars = fs.readFileSync(path.resolve(__dirname, 'mode-starwars.js'), 'utf8');
const appJs = fs.readFileSync(path.resolve(__dirname, 'app.js'), 'utf8');

// Create JSDOM with scripts
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    url: 'file://' + __dirname + '/'
});

const { window } = dom;
global.window = window;
global.document = window.document;
global.requestAnimationFrame = (cb) => window.setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => window.clearTimeout(id);

// Execute scripts in order
const scripts = [modeWord, modeChunk, modeLine, modeStarWars, appJs];
scripts.forEach(script => {
    try {
        window.eval(script);
    } catch (e) {
        console.error('Script error:', e.message);
    }
});

// Wait for DOMContentLoaded
return new Promise((resolve) => {
    if (window.document.readyState === 'complete') {
        resolve();
    } else {
        window.addEventListener('load', resolve);
    }
}).then(async () => {
    console.log('=== Testing Star Wars Mode ===\n');
    
    // Simulate selecting starwars mode and starting
    const wordDisplay = window.document.getElementById('word-display');
    const inputText = window.document.getElementById('input-text');
    
    // Set test text
    if (inputText) {
        inputText.value = 'Hace millones de años no existían ciudades ni escritura. Los primeros seres humanos vivían en África.';
    }
    
    // Call selectMode
    if (window.selectMode) {
        window.selectMode('starwars');
        console.log('Mode selected: starwars');
    }
    
    // Call goToTextConfig -> startWithConfig
    if (window.goToTextConfig) {
        window.goToTextConfig();
    }
    
    // Wait a bit for modal transitions
    await new Promise(r => window.setTimeout(r, 100));
    
    if (window.startWithConfig) {
        window.startWithConfig();
        console.log('startWithConfig called');
    }
    
    // Wait for render
    await new Promise(r => window.setTimeout(r, 200));
    
    // Check state
    console.log('\n=== After startReading ===');
    console.log('wordDisplay innerHTML length:', wordDisplay.innerHTML.length);
    console.log('wordDisplay className:', wordDisplay.className);
    console.log('body classList:', window.document.body.className);
    
    // Check for starwars elements
    const scroller = wordDisplay.querySelector('.starwars-scroller');
    const content = wordDisplay.querySelector('.starwars-content');
    const chunks = wordDisplay.querySelectorAll('.starwars-chunk');
    
    console.log('\n=== Star Wars Elements ===');
    console.log('scroller exists:', !!scroller);
    console.log('content exists:', !!content);
    console.log('chunks count:', chunks.length);
    
    if (scroller) {
        console.log('scroller transform:', scroller.style.transform);
        console.log('scroller offsetHeight:', scroller.offsetHeight);
    }
    if (content) {
        console.log('content offsetHeight:', content.offsetHeight);
        console.log('content scrollHeight:', content.scrollHeight);
        console.log('content innerHTML preview:', content.innerHTML.substring(0, 200));
        console.log('content style.opacity:', content.style.opacity);
        console.log('content style.color:', window.getComputedStyle(content).color);
    }
    
    // Check global variables
    console.log('\n=== Global Variables ===');
    console.log('starWarsGroups:', window.starWarsGroups ? window.starWarsGroups.length : 'undefined');
    console.log('starWarsInitialOffset:', window.starWarsInitialOffset);
    console.log('starWarsCenterOffset:', window.starWarsCenterOffset);
    console.log('starWarsFinalOffset:', window.starWarsFinalOffset);
    console.log('starWarsTotalDuration:', window.starWarsTotalDuration);
    console.log('starWarsTotalDurationWithFade:', window.starWarsTotalDurationWithFade);
    console.log('starWarsOffset:', window.starWarsOffset);
    console.log('starWarsPhase:', window.starWarsPhase);
    console.log('starWarsStartTime:', window.starWarsStartTime);
    console.log('isRunning:', window.isRunning);
    console.log('isPaused:', window.isPaused);
    console.log('mode:', window.mode);
    console.log('wpm:', window.wpm);
    
    // Simulate a few animation frames
    console.log('\n=== Simulating Animation Frames ===');
    for (let i = 0; i < 5; i++) {
        if (window.animateStarWars) {
            window.animateStarWars(window.performance.now());
            await new Promise(r => window.setTimeout(r, 50));
        }
        if (scroller) {
            console.log(`Frame ${i}: transform=${scroller.style.transform}, offset=${window.starWarsOffset}`);
        }
    }
    
    // Check if content is actually in viewport
    if (content && scroller) {
        const rect = content.getBoundingClientRect();
        console.log('\n=== Content Position ===');
        console.log('content rect:', rect);
        console.log('viewport height:', window.innerHeight);
        console.log('Is content in viewport?', rect.bottom > 0 && rect.top < window.innerHeight);
    }
    
    window.close();
}).catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
});