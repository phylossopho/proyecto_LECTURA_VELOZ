function renderLineDisplay() {
    if (sentences.length === 0) {
        wordDisplay.innerHTML = '<span>Sin texto</span>';
        return;
    }
    var sentence = sentences[currentSentence];
    var totalWords = sentence.split(/\s+/).filter(function(w) { return w.length > 0; }).length;
    wordDisplay.className = 'line-display fade-in';
    wordDisplay.innerHTML = sentence;

    currentIndex = currentSentence;
    wordCounter.style.display = 'none';

    var progress = sentences.length > 0 ? (currentSentence / sentences.length) * 100 : 0;

    sentenceStartTime = Date.now();
    sentenceDuration = (totalWords / wpm) * 60000;
    if (sentenceDuration < 1500) sentenceDuration = 1500;
}


function updateLineTimer() {
    if (!isRunning || isPaused || mode !== 'line') return;
    var elapsed = Date.now() - sentenceStartTime;
    var remaining = Math.max(0, 1 - elapsed / sentenceDuration);
    lineTimerFill.style.width = (remaining * 100) + '%';
}


function scheduleLineNext() {
    scheduleTimeout = setTimeout(function() {
        if (isRunning && !isPaused) {
            currentSentence++;
            if (currentSentence >= sentences.length) {
                finishReading();
                return;
            }
            renderLineDisplay();
            scheduleLineNext();
        }
    }, sentenceDuration);
}

