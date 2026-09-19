// Estado global
var mode = 'word';
var wpm = 250;
var chunkSize = 5;
var fontSize = 'medium';
var currentTheme = 'dark';

var words = [];
var chunks = [];
var sentences = [];
var currentIndex = 0;
var currentChunk = 0;
var currentSentence = 0;
var isRunning = false;
var isPaused = false;
var scheduleTimeout = null;
var trainingStats = { sessions: 0, totalWords: 0, totalTime: 0, bestWPM: 0 };

var wordDisplay = null;
var wordCounter = null;
var elapsedTimeEl = null;
var wpmSlider = null;
var wpmDisplay = null;
var lineTimerBar = null;
var lineTimerFill = null;
var pauseIndicator = null;
var btnStart = null;
var btnPause = null;
var btnReset = null;
var chunkRow = null;
var modeBadge = null;
var inputText = null;

// Elementos de modales
var modeModal = null;
var configModal = null;
var textsModal = null;
var settingsModal = null;
var themeEditorModal = null;
var visualCustomizerModal = null;

// Inicialización
function init() {
    cacheDOM();
    bindEvents();
    loadPreferences();
    applyTheme();
    showModeModal();
}

function cacheDOM() {
    wordDisplay = document.getElementById('word-display');
    wordCounter = document.getElementById('word-counter');
    elapsedTimeEl = document.getElementById('elapsed-time');
    wpmSlider = document.getElementById('wpm-slider');
    wpmDisplay = document.getElementById('wpm-display');
    lineTimerBar = document.getElementById('line-timer-bar');
    lineTimerFill = document.getElementById('line-timer-fill');
    pauseIndicator = document.getElementById('pause-indicator');
    btnStart = document.getElementById('btn-start');
    btnPause = document.getElementById('btn-pause');
    btnReset = document.getElementById('btn-reset');
    chunkRow = document.getElementById('chunk-row');
    modeBadge = document.getElementById('mode-badge');
    inputText = document.getElementById('input-text');

    modeModal = document.getElementById('mode-modal');
    configModal = document.getElementById('config-modal');
    textsModal = document.getElementById('texts-modal');
    settingsModal = document.getElementById('settings-modal');
    themeEditorModal = document.getElementById('theme-editor-modal');
    visualCustomizerModal = document.getElementById('visual-customizer-modal');
}

function bindEvents() {
    document.addEventListener('keydown', handleKeydown);
    wpmSlider.addEventListener('input', updateWPM);
}

function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isRunning) startReading();
        else if (isPaused) togglePause();
        else advanceNext();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (isRunning && !isPaused) advancePrevious();
    } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
    } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        adjustWPM(20);
    } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        adjustWPM(-20);
    }
}

// ===== Flujo principal =====

function startReading() {
    var text = getInputText();
    if (!text || !text.trim()) {
        alert('Por favor, introduce un texto para practicar');
        return;
    }
    
    loadText(text);
    closeAllModals();
    
    isRunning = true;
    isPaused = false;
    currentIndex = 0;
    currentChunk = 0;
    currentSentence = 0;
    
    btnStart.disabled = true;
    btnPause.disabled = false;
    pauseIndicator.classList.remove('visible');
    
    renderDisplay();
    scheduleNext();
    startTimer();
}

function togglePause() {
    if (!isRunning) return;
    
    isPaused = !isPaused;
    btnPause.textContent = isPaused ? 'Continuar' : 'Pausa';
    pauseIndicator.classList.toggle('visible', isPaused);
    
    if (isPaused) {
        clearTimeout(scheduleTimeout);
        if (mode === 'starwars') pauseStarWars();
    } else {
        scheduleNext();
        if (mode === 'starwars') resumeStarWars();
    }
}

function resetReading() {
    isRunning = false;
    isPaused = false;
    clearTimeout(scheduleTimeout);
    if (mode === 'starwars') clearStarWarsPresentation();
    
    currentIndex = 0;
    currentChunk = 0;
    currentSentence = 0;
    
    btnStart.disabled = false;
    btnPause.disabled = true;
    btnPause.textContent = 'Pausa';
    pauseIndicator.classList.remove('visible');
    stopTimer();
    
    wordDisplay.innerHTML = '<span>Prepara tu texto y haz clic en Iniciar</span>';
    wordDisplay.className = 'word-display';
    wordCounter.style.display = '';
    lineTimerBar.style.display = 'none';
    document.body.classList.remove('starwars-bg');
    modeBadge.style.display = 'none';
    chunkRow.style.display = mode === 'chunk' ? 'flex' : 'none';
}

function finishReading() {
    isRunning = false;
    isPaused = false;
    clearTimeout(scheduleTimeout);
    if (mode === 'starwars') clearStarWarsPresentation();
    
    btnStart.disabled = false;
    btnPause.disabled = true;
    btnPause.textContent = 'Pausa';
    pauseIndicator.classList.remove('visible');
    stopTimer();
    
    wordDisplay.innerHTML = '<span class="focal">¡Fin!</span>';
    wordDisplay.className = 'word-display fade-in';
    
    updateStats();
    showModeModal();
}

function advanceNext() {
    if (mode === 'word') {
        currentIndex++;
        if (currentIndex >= words.length) { finishReading(); return; }
    } else if (mode === 'chunk') {
        currentChunk++;
        if (currentChunk >= chunks.length) { finishReading(); return; }
    } else if (mode === 'line') {
        currentSentence++;
        if (currentSentence >= sentences.length) { finishReading(); return; }
    } else if (mode === 'starwars') {
        // Star Wars avanza solo con animación
        return;
    }
    renderDisplay();
    scheduleNext();
}

function advancePrevious() {
    if (mode === 'word' && currentIndex > 0) {
        currentIndex--;
        renderDisplay();
    }
}

function scheduleNext() {
    if (!isRunning || isPaused) return;
    
    if (mode === 'word') scheduleWordNext();
    else if (mode === 'chunk') scheduleChunkNext();
    else if (mode === 'line') scheduleLineNext();
    else if (mode === 'starwars') startStarWarsAnimation();
}

// ===== Render =====

function renderDisplay() {
    if (mode === 'word') renderWordDisplay();
    else if (mode === 'chunk') renderChunkDisplay();
    else if (mode === 'line') renderLineDisplay();
    else if (mode === 'starwars') renderStarWarsDisplay();
    
    updateCounter();
    updateModeBadge();
}

function updateCounter() {
    var current, total;
    if (mode === 'word') { current = currentIndex + 1; total = words.length; }
    else if (mode === 'chunk') { current = currentChunk + 1; total = chunks.length; }
    else if (mode === 'line') { current = currentSentence + 1; total = sentences.length; }
    else { current = 1; total = 1; }
    
    if (wordCounter) wordCounter.textContent = current + ' / ' + total;
}

function updateModeBadge() {
    if (!modeBadge) return;
    var labels = { word: 'Palabra', chunk: 'Grupo', line: 'Frase', starwars: 'Estrella Wars', texts: 'Textos' };
    modeBadge.textContent = labels[mode] || mode;
    modeBadge.style.display = mode === 'texts' ? 'none' : 'block';
}

// ===== Procesamiento de texto =====

function getInputText() {
    if (inputText) return inputText.value;
    return '';
}

function loadText(text) {
    words = text.trim().split(/\s+/).filter(function(w) { return w.length > 0; });
    sentences = splitSentences(text);
    chunks = splitIntoChunks(text, chunkSize);
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
        var chunkWords = allWords.slice(start, end);
        result.push({ words: chunkWords, endsWith: getEndType(chunkWords[chunkWords.length - 1]) });
        start = end;
    }
    return result;
}

function getEndType(word) {
    if (/[.!?…]$/.test(word)) return 'sentence';
    if (/[,;]$/.test(word)) return 'clause';
    if (/[:]$/.test(word)) return 'list';
    return 'normal';
}

function cleanWord(word) {
    return word.replace(/[.,;:!?()\-\[\]"']/g, '');
}

function getPauseForEndType(type) {
    switch (type) {
        case 'sentence': return 600;
        case 'clause': return 350;
        case 'list': return 300;
        default: return 200;
    }
}

// ===== Timer =====

var timerStart = 0;
var pausedDuration = 0;
var timerInterval = null;

function startTimer() {
    timerStart = Date.now();
    pausedDuration = 0;
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimer() {
    if (!isRunning) return;
    var elapsed = isPaused ? pausedDuration : Math.floor((Date.now() - timerStart) / 1000);
    if (elapsedTimeEl) elapsedTimeEl.textContent = formatTime(elapsed);
    
    if (mode === 'line' && !isPaused) updateLineTimer();
}

function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + s.toString().padStart(2, '0');
}

// ===== Controles WPM / Chunk =====

function updateWPM() {
    wpm = parseInt(wpmSlider.value, 10);
    if (wpmDisplay) wpmDisplay.textContent = wpm;
}

function adjustWPM(delta) {
    wpm = Math.max(50, Math.min(600, wpm + delta));
    if (wpmSlider) wpmSlider.value = wpm;
    if (wpmDisplay) wpmDisplay.textContent = wpm;
}

function setChunk(size) {
    chunkSize = size;
    document.querySelectorAll('.chunk-opt').forEach(function(btn) {
        btn.classList.toggle('active', parseInt(btn.dataset.chunk, 10) === size);
    });
    if (isRunning && mode === 'chunk') {
        loadText(getInputText());
        currentChunk = 0;
        renderDisplay();
    }
}

// ===== Modales =====

function showModeModal() {
    if (modeModal) modeModal.classList.remove('hidden');
}

function closeAllModals() {
    [modeModal, configModal, textsModal, settingsModal, themeEditorModal, visualCustomizerModal].forEach(function(m) {
        if (m) m.classList.add('hidden');
    });
}

function selectMode(m) {
    mode = m;
    document.querySelectorAll('.mode-card').forEach(function(card) {
        card.classList.toggle('active', card.dataset.mode === m);
    });
    chunkRow.style.display = m === 'chunk' ? 'flex' : 'none';
    updateModeBadge();
}

function goToTextConfig() {
    if (mode === 'texts') {
        openTextsModal();
    } else {
        closeAllModals();
        if (configModal) configModal.classList.remove('hidden');
    }
}

function backToModeSelection() {
    closeAllModals();
    if (modeModal) modeModal.classList.remove('hidden');
}

function loadFileText(event) {
    var file = event.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        if (inputText) inputText.value = e.target.result;
        event.target.value = '';
    };
    reader.readAsText(file);
}

function startWithConfig() {
    var text = inputText ? inputText.value : '';
    if (text && text.trim()) {
        closeAllModals();
        startReading();
    }
}

function openSettings() {
    if (settingsModal) settingsModal.classList.remove('hidden');
}

function closeSettings() {
    if (settingsModal) settingsModal.classList.add('hidden');
}

function openTextsModal() {
    if (textsModal) textsModal.classList.remove('hidden');
    renderTextsList();
}

function closeTextsModal() {
    if (textsModal) textsModal.classList.add('hidden');
}

function openVisualCustomizer() {
    if (visualCustomizerModal) visualCustomizerModal.classList.remove('hidden');
}

function exitVisualCustomizer() {
    if (visualCustomizerModal) visualCustomizerModal.classList.add('hidden');
}

function toggleVisualInspect() {
    // Placeholder
}

function openThemeEditor() {
    if (themeEditorModal) themeEditorModal.classList.remove('hidden');
}

function closeThemeEditor() {
    if (themeEditorModal) themeEditorModal.classList.add('hidden');
}

// Textos de ejemplo
var sampleTexts = [
    'La lectura veloz es una habilidad que se puede entrenar. Con práctica diaria, cualquier persona puede duplicar su velocidad de lectura manteniendo la comprensión. El secreto está en eliminar la subvocalización y usar la visión periférica.',
    'La fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía. Las hojas capturan la luz con la clorofila y la usan para transformar dióxido de carbono y agua en glucosa y oxígeno. Es la base de la vida en la Tierra.',
    'Las ciudades modernas son ecosistemas complejos donde millones de personas conviven. El transporte, la energía, los residuos y la comunicación forman redes invisibles que sostienen la vida urbana. Planificar ciudades sostenibles es el reto del siglo XXI.',
    'Cada día es una nueva oportunidad para mejorar. No importa cuántas veces hayas fallado, lo importante es intentarlo de nuevo. La constancia vence al talento cuando el talento no es constante. Tú eres capaz de más de lo que imaginas.',
    'Los bosques son los pulmones del planeta. Árboles centenarios, ríos cristalinos y una biodiversidad infinita crean un equilibrio perfecto. Proteger la naturaleza no es opcional, es nuestra responsabilidad como especie.',
    'La tecnología avanza a pasos agigantados. Inteligencia artificial, realidad virtual, computación cuántica: lo que era ciencia ficción ayer es realidad hoy. Adaptarse al cambio es la única constante en la era digital.'
];

var historyTexts = {
    'primeros_seres_humanos': 'Hace millones de años no existían ciudades ni escritura. Los primeros seres humanos vivían en África y se parecían a los simios. Caminaban a dos piernas, usaban piedras como herramientas y vivían en grupos pequeños. A esta etapa la llamamos prehistoria porque no hay escritura que cuente lo que pasó. Un hallazgo muy importante fue Lucy. En 1974, científicos encontraron en Etiopía los huesos de una hembra de Australopithecus. Tenía más de tres millones de años. Medía un metro y pesaba veintisiete kilos. Su cerebro era pequeño pero ya caminaba erguida. Lucy nos enseña que los humanos evolucionaron lentamente. Otro hallazgo son las pinturas rupestres. En cuevas de Europa y África se encontraron dibujos de animales y manos hechas hace miles de años. Estos dibujos demuestran que los primeros humanos ya tenían capacidad de expresión y pensamiento. Durante la prehistoria, los grupos humanos eran pequeños y se moveban constantemente buscando comida. Usaban piedras afiladas, huesos y madera para crear las primeras herramientas.',
    'vida_nomada': 'Hace mucho tiempo los seres humanos no tenían casa fija. Eran nómadas, es decir, se movían de un lugar a otro. Su alimentación dependía de lo que encontraran. Cazaban animales como mamuts y recolectaban frutas, raíces y semillas. Los mamuts eran gigantes con pelaje largo. Parecidos a los elefantes, migraron de África hace millones de años. Los cazadores los perseguían hasta que quedaban atrapados en pantanos. Luego les lanzaban lanzas y flechas. En la cuenca de México también vivían mamuts, ya que el clima era similar al de una sabana con lagos. Los huesos de estos animales se han encontrado en lo que hoy es la Ciudad de México. La caza era peligrosa y la comida no siempre abundaba. Por eso los grupos nómadas desarrollaron gran capacidad de observación y memoria. Conocían cada planta, cada rastro de animal y cada cambio de estación. La vida nómada requería cooperación: todos trabajaban para la supervivencia del grupo.',
    'nomadismo_sedentarismo': 'Hace unos diez mil años ocurrió un cambio fundamental. Algunos grupos nómadas empezaron a cultivar plantas y domesticar animales. Ya no necesitaban moverse constantemente para encontrar comida. Podían quedarse en un lugar y producir su propio alimento. Así nació la agricultura y con ella los primeros asentamientos permanentes. La gente construyó casas de adobe, creó almacenes para guardar cosechas y desarrolló nuevas herramientas como la hoz y el mortero. La sedentarización trajo especialización: no todos debían cultivar, algunos se dedicaban a la cerámica, el tejido o la metalurgia. Surgieron los primeros pueblos y luego las primeras ciudades. La escritura apareció para llevar cuentas de la producción y el comercio. La humanidad había entrado en una nueva era: la historia.'
};

function loadSample(idx) {
    if (inputText && sampleTexts[idx]) {
        inputText.value = sampleTexts[idx];
    }
}

function loadHistory(key) {
    if (inputText && historyTexts[key]) {
        inputText.value = historyTexts[key];
    }
}

// ===== Preferencias =====

function loadPreferences() {
    try {
        currentTheme = localStorage.getItem('reading-theme') || 'dark';
        wpm = parseInt(localStorage.getItem('reading-wpm'), 10) || 250;
        chunkSize = parseInt(localStorage.getItem('reading-chunkSize'), 10) || 5;
        mode = localStorage.getItem('reading-mode') || 'word';
        fontSize = localStorage.getItem('reading-fontSize') || 'medium';
        
        var stats = localStorage.getItem('reading-stats');
        if (stats) trainingStats = JSON.parse(stats);
    } catch (e) {}
    
    if (wpmSlider) wpmSlider.value = wpm;
    if (wpmDisplay) wpmDisplay.textContent = wpm;
    document.body.className = 'theme-' + currentTheme;
    document.body.classList.add('font-' + fontSize);
    document.querySelectorAll('.mode-card').forEach(function(card) {
        card.classList.toggle('active', card.dataset.mode === mode);
    });
    document.querySelectorAll('.chunk-opt').forEach(function(btn) {
        btn.classList.toggle('active', parseInt(btn.dataset.chunk, 10) === chunkSize);
    });
    chunkRow.style.display = mode === 'chunk' ? 'flex' : 'none';
}

function savePreferences() {
    try {
        localStorage.setItem('reading-theme', currentTheme);
        localStorage.setItem('reading-wpm', String(wpm));
        localStorage.setItem('reading-chunkSize', String(chunkSize));
        localStorage.setItem('reading-mode', mode);
        localStorage.setItem('reading-fontSize', fontSize);
        localStorage.setItem('reading-stats', JSON.stringify(trainingStats));
    } catch (e) {}
}

function setTheme(theme) {
    currentTheme = theme;
    document.body.className = 'theme-' + theme;
    document.querySelectorAll('.font-opt[data-theme]').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    savePreferences();
}

function setFontSize(size) {
    fontSize = size;
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + size);
    document.querySelectorAll('.font-opt[data-size]').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
    savePreferences();
}

function setColor(type, value) {
    // Placeholder para compatibilidad
    savePreferences();
}

function quickWPMChange(val) {
    wpm = parseInt(val, 10);
    if (wpmSlider) wpmSlider.value = wpm;
    if (wpmDisplay) wpmDisplay.textContent = wpm;
    savePreferences();
}

function setChunkSize(size) {
    setChunk(size);
    savePreferences();
}

function applyTheme() {
    document.body.className = 'theme-' + currentTheme + ' font-' + fontSize;
}

function updateStats() {
    trainingStats.sessions++;
    trainingStats.totalWords += words.length;
    var elapsed = Math.floor((Date.now() - timerStart) / 1000);
    trainingStats.totalTime += elapsed;
    if (wpm > trainingStats.bestWPM) trainingStats.bestWPM = wpm;
    savePreferences();
}

// ===== Personalizador visual (existente) =====

function showElementProps(el) {
    var container = document.getElementById('visual-customizer-props');
    var style = window.getComputedStyle(el);
    var props = [];
    
    var varNames = getCssVarsForElement(el);
    var rootStyle = getComputedStyle(document.documentElement);
    
    var propLabels = {
        'backgroundColor': 'Color de fondo',
        'color': 'Color de texto',
        'borderColor': 'Color de borde',
        'borderTopColor': 'Borde superior',
        'borderRightColor': 'Borde derecho',
        'borderBottomColor': 'Borde inferior',
        'borderLeftColor': 'Borde izquierdo',
        'outlineColor': 'Color de contorno',
        'caretColor': 'Color de cursor',
        'accentColor': 'Color de acento'
    };
    
    for (var i = 0; i < varNames.length; i++) {
        var varName = varNames[i];
        var info = cssVarInfo[varName] || { name: varName, category: 'otros' };
        var varValue = rootStyle.getPropertyValue(varName).trim();
        if (!varValue) continue;
        
        var actualProp = detectAffectedProperty(el, style, varValue);
        var propLabel = actualProp ? propLabels[actualProp] || actualProp : (info.name || varName);
        
        var category = info.category;
        if (actualProp) {
            if (actualProp === 'backgroundColor') category = 'fondos';
            else if (actualProp === 'color') category = 'textos';
            else if (actualProp.indexOf('border') === 0 || actualProp === 'outlineColor') category = 'bordes';
            else if (actualProp === 'caretColor' || actualProp === 'accentColor') category = 'inputs';
        }
        
        props.push({
            varName: varName,
            value: varValue,
            label: propLabel,
            category: category,
            actualProp: actualProp
        });
    }
    
    var colorProps = [
        { prop: 'backgroundColor', label: 'Color de fondo', category: 'fondos' },
        { prop: 'color', label: 'Color de texto', category: 'textos' },
        { prop: 'borderColor', label: 'Color de borde', category: 'bordes' },
        { prop: 'caretColor', label: 'Color de cursor', category: 'inputs' },
        { prop: 'accentColor', label: 'Color de acento', category: 'acento' }
    ];
    
    for (var i = 0; i < colorProps.length; i++) {
        var cp = colorProps[i];
        var value = style[cp.prop];
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
            var alreadyHave = props.some(function(p) { 
                return p.value === value || p.varName === findCssVarForColorDirect(value); 
            });
            if (!alreadyHave) {
                props.push({
                    varName: '--custom-color',
                    value: value,
                    label: cp.label + ' (directo)',
                    category: cp.category,
                    actualProp: cp.prop
                });
            }
        }
    }
    
    var categories = {};
    for (var j = 0; j < props.length; j++) {
        var cat = props[j].category;
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(props[j]);
    }
    
    var html = '';
    var catOrder = ['fondos', 'textos', 'acento', 'botones', 'especial', 'modo-textos', 'inputs', 'bordes', 'otros'];
    for (var k = 0; k < catOrder.length; k++) {
        var cat = catOrder[k];
        if (!categories[cat]) continue;
        html += '<div style="margin-bottom:16px;"><h5 style="margin:0 0 8px;font-size:0.7rem;color:var(--accent-primary);text-transform:uppercase;">' + cat + '</h5>';
        for (var l = 0; l < categories[cat].length; l++) {
            var p = categories[cat][l];
            var propIndicator = p.actualProp ? ' <span style="font-size:0.6rem;color:var(--text-muted);">(' + (propLabels[p.actualProp] || p.actualProp) + ')</span>' : '';
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:6px;background:var(--bg-tertiary);border-radius:6px;">' +
                '<span style="font-size:0.7rem;color:var(--text-secondary);min-width:120px;">' + p.label + propIndicator + '</span>' +
                '<input type="color" value="' + p.value + '" data-var="' + p.varName + '" oninput="applyVisualColor(\'' + p.varName + '\', this.value)" onchange="applyVisualColor(\'' + p.varName + '\', this.value)" style="width:32px;height:32px;border:none;border-radius:4px;cursor:pointer;">' +
                '<span style="font-size:0.65rem;font-family:monospace;color:var(--text-muted);flex:1;">' + p.varName + '</span>' +
                '</div>';
        }
        html += '</div>';
    }
    
    if (html === '') {
        html = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No se detectaron propiedades de color editables en este elemento</div>';
    }
    
    container.innerHTML = html;
}

function detectAffectedProperty(el, style, varValue) {
    var normalizedVar = normalizeColor(varValue);
    var colorProps = [
        'backgroundColor', 'color', 'borderColor', 'borderTopColor',
        'borderRightColor', 'borderBottomColor', 'borderLeftColor',
        'outlineColor', 'caretColor', 'accentColor'
    ];
    
    for (var i = 0; i < colorProps.length; i++) {
        var prop = colorProps[i];
        var styleValue = style[prop];
        if (styleValue && styleValue !== 'rgba(0, 0, 0, 0)' && styleValue !== 'transparent') {
            if (normalizeColor(styleValue) === normalizedVar) {
                return prop;
            }
        }
    }
    return null;
}

function normalizeColor(c) {
    return String(c).trim().toLowerCase();
}

function findCssVarForColorDirect(color) {
    return null;
}

function applyVisualColor(varName, value) {
    document.documentElement.style.setProperty(varName, value);
}

function getCssVarsForElement(el) {
    return [];
}

var cssVarInfo = {};

// Iniciar al cargar
document.addEventListener('DOMContentLoaded', init);