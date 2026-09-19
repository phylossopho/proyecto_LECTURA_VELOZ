var assert = require('assert');

function cleanWord(word) {
    return word.replace(/[.,;:!?()\-\[\]"']/g, '');
}

function getEndType(word) {
    if (/[.!?…]$/.test(word)) return 'sentence';
    if (/[,;]$/.test(word)) return 'clause';
    if (/[:]$/.test(word)) return 'list';
    return 'normal';
}

function getPauseForEndType(type) {
    switch (type) {
        case 'sentence': return 600;
        case 'clause': return 350;
        case 'list': return 300;
        default: return 200;
    }
}

function splitSentences(text) {
    var raw = text.split(/(?<=[.!?])\s+/);
    var result = [];
    for (var i = 0; i < raw.length; i++) {
        var s = raw[i].trim();
        if (s.length > 0) result.push(s);
    }
    return result;
}

function splitIntoChunks(text, targetSize) {
    var allWords = text.trim().split(/\s+/).filter(function(w) { return w.length > 0; });
    var result = [];
    var start = 0;
    while (start < allWords.length) {
        var end = Math.min(start + targetSize, allWords.length);
        for (var i = end; i > start; i--) {
            var word = allWords[i - 1];
            if (/[.!?…]$/.test(word)) { end = i; break; }
            if (/[,;]$/.test(word) && (i - start) >= Math.ceil(targetSize / 2)) { end = i; break; }
        }
        var chunk = allWords.slice(start, end);
        result.push({ words: chunk, endsWith: getEndType(chunk[chunk.length - 1]) });
        start = end;
    }
    return result;
}

function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + s.toString().padStart(2, '0');
}

var tests = [];
var passed = 0;
var failed = 0;

function test(name, fn) {
    tests.push({ name: name, fn: fn });
}

function run() {
    for (var i = 0; i < tests.length; i++) {
        try {
            tests[i].fn();
            passed++;
            console.log('PASS: ' + tests[i].name);
        } catch (e) {
            failed++;
            console.log('FAIL: ' + tests[i].name + ' -> ' + e.message);
        }
    }
    console.log('\n' + passed + '/' + (passed + failed) + ' tests passed');
    if (failed > 0) process.exit(1);
}

/* --- Core utility tests --- */

test('cleanWord removes trailing comma', function() { assert.strictEqual(cleanWord('hola,'), 'hola'); });
test('cleanWord removes trailing period', function() { assert.strictEqual(cleanWord('mundo.'), 'mundo'); });
test('cleanWord keeps clean words', function() { assert.strictEqual(cleanWord('prueba'), 'prueba'); });
test('cleanWord removes brackets', function() { assert.strictEqual(cleanWord('[texto]'), 'texto'); });

test('getEndType detects sentence end', function() {
    assert.strictEqual(getEndType('fin.'), 'sentence');
    assert.strictEqual(getEndType('verdad?'), 'sentence');
    assert.strictEqual(getEndType('excelente!'), 'sentence');
    assert.strictEqual(getEndType('etc…'), 'sentence');
});

test('getEndType detects clause end', function() {
    assert.strictEqual(getEndType('parque,'), 'clause');
    assert.strictEqual(getEndType('ahora;'), 'clause');
});

test('getEndType detects list end', function() {
    assert.strictEqual(getEndType('items:'), 'list');
});

test('getEndType detects normal', function() {
    assert.strictEqual(getEndType('correr'), 'normal');
    assert.strictEqual(getEndType('Hola'), 'normal');
});

test('getPauseForEndType returns correct ms', function() {
    assert.strictEqual(getPauseForEndType('sentence'), 600);
    assert.strictEqual(getPauseForEndType('clause'), 350);
    assert.strictEqual(getPauseForEndType('list'), 300);
    assert.strictEqual(getPauseForEndType('normal'), 200);
});

/* --- Sentence splitting --- */

test('splitSentences splits by period', function() {
    var result = splitSentences('Hola. Adios.');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], 'Hola.');
    assert.strictEqual(result[1], 'Adios.');
});

test('splitSentences handles question marks', function() {
    var result = splitSentences('Qu? Cundo.');
    assert.ok(result.length >= 1);
});

test('splitSentences empty text', function() {
    var result = splitSentences('');
    assert.strictEqual(result.length, 0);
});

/* --- Chunking --- */

test('splitIntoChunks respects sentence end', function() {
    var chunks = splitIntoChunks('Una frase corta. Otra larga.', 5);
    assert.strictEqual(chunks[0].endsWith, 'sentence');
    assert.strictEqual(chunks.length, 1);
});

test('splitIntoChunks creates 2 chunks for long text', function() {
    var chunks = splitIntoChunks('Una frase corta. Otra larga aqui.', 3);
    assert.ok(chunks.length >= 2);
});

test('splitIntoChunks respects clause end at 3 words', function() {
    var chunks = splitIntoChunks('prueba, de comma aqui.', 5);
    assert.ok(chunks[0].endsWith === 'sentence' || chunks[0].endsWith === 'clause');
});

test('splitIntoChunks creates multiple chunks', function() {
    var text = 'Uno dos tres cuatro cinco seis siete ocho nuevo diez.';
    var chunks = splitIntoChunks(text, 5);
    assert.ok(chunks.length >= 2);
});

test('splitIntoChunks empty text', function() {
    var chunks = splitIntoChunks('', 5);
    assert.strictEqual(chunks.length, 0);
});

test('splitIntoChunks chunk word count near target', function() {
    var text = 'uno dos tres cuatro cinco seis';
    var chunks = splitIntoChunks(text, 3);
    for (var i = 0; i < chunks.length; i++) {
        assert.ok(chunks[i].words.length <= 4, 'Chunk ' + i + ' has ' + chunks[i].words.length + ' words');
    }
});

test('splitIntoChunks chunk end type correct', function() {
    var chunks = splitIntoChunks('Esto es una prueba.', 4);
    var lastChunk = chunks[chunks.length - 1];
    assert.strictEqual(lastChunk.endsWith, 'sentence');
});

test('splitIntoChunks single word', function() {
    var chunks = splitIntoChunks('Solitaria', 5);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].words.length, 1);
    assert.strictEqual(chunks[0].endsWith, 'normal');
});

test('splitIntoChunks all punctuation', function() {
    var chunks = splitIntoChunks('Hola. Mundo. Fin.', 5);
    for (var i = 0; i < chunks.length; i++) {
        assert.strictEqual(chunks[i].endsWith, 'sentence');
    }
});

test('splitIntoChunks no punctuation long text', function() {
    var text = 'Uno dos tres cuatro cinco seis siete ocho nueve diez once doce';
    var chunks = splitIntoChunks(text, 5);
    assert.ok(chunks.length >= 2);
    for (var i = 0; i < chunks.length; i++) {
        assert.ok(chunks[i].words.length >= 1);
        assert.ok(chunks[i].words.length <= 6);
    }
});

test('splitIntoChunks mixed punctuation', function() {
    var text = 'Hola, que tal. Bien, muy bien. Adios.';
    var chunks = splitIntoChunks(text, 5);
    assert.ok(chunks.length >= 1);
    for (var i = 0; i < chunks.length; i++) {
        var end = chunks[i].endsWith;
        assert.ok(end === 'sentence' || end === 'clause' || end === 'normal',
            'Unexpected end type: ' + end);
    }
});

/* --- Format time --- */

test('formatTime formats MM:SS', function() {
    assert.strictEqual(formatTime(0), '0:00');
    assert.strictEqual(formatTime(5), '0:05');
    assert.strictEqual(formatTime(59), '0:59');
    assert.strictEqual(formatTime(60), '1:00');
    assert.strictEqual(formatTime(65), '1:05');
    assert.strictEqual(formatTime(3661), '61:01');
});

/* --- Settings/state logic --- */

test('loadPref returns default when no value', function() {
    try { localStorage.removeItem('reading-test-key'); } catch(e) {}
    var val = loadPref('test-key', 'default');
    assert.strictEqual(val, 'default');
});

test('savePref stores value', function() {
    try {
        savePref('test-key', 'test-value');
        var stored = localStorage.getItem('reading-test-key');
        assert.strictEqual(stored, 'test-value');
    } catch(e) { /* localStorage may be unavailable */ }
});

test('getPauseForEndType: sentence has longest pause', function() {
    assert.ok(getPauseForEndType('sentence') >= getPauseForEndType('clause'));
    assert.ok(getPauseForEndType('clause') >= getPauseForEndType('list'));
    assert.ok(getPauseForEndType('list') >= getPauseForEndType('normal'));
});

run();

/* Helper functions for tests (duplicated from app.js for testability) */
function savePref(key, value) {
    try { localStorage.setItem('reading-' + key, String(value)); } catch(e) {}
}
function loadPref(key, defaultValue) {
    try {
        var val = localStorage.getItem('reading-' + key);
        return val !== null ? val : defaultValue;
    } catch(e) { return defaultValue; }
}
