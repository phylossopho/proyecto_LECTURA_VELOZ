function renderWordDisplay() {
    if (words.length === 0) {
        wordDisplay.innerHTML = '<span>Prepara tu texto</span>';
        return;
    }

    var html = '';
    var end = Math.min(currentIndex + 1, words.length);
    var ctxBefore = currentIndex - 1;
    var ctxAfter = currentIndex + 1;

    if (ctxBefore >= 0) {
        html += '<span class="context-extra">' + cleanWord(words[ctxBefore]) + ' </span>';
    }

    for (var i = currentIndex; i < end; i++) {
        var word = cleanWord(words[i]);
        html += '<span class="pointer">|</span><span class="focal">' + word + '</span>';
    }

    if (ctxAfter < words.length) {
        html += ' <span class="context-extra">' + cleanWord(words[ctxAfter]) + '</span>';
    }

    wordDisplay.className = 'word-display fade-in';
    wordDisplay.innerHTML = html;

    var progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
}


function scheduleWordNext() {
    var interval = (60 / wpm) * 1000;
    scheduleTimeout = setTimeout(function() {
        if (isRunning && !isPaused) {
            currentIndex++;
            if (currentIndex >= words.length) {
                finishReading();
                return;
            }
            renderWordDisplay();
            scheduleWordNext();
        }
    }, interval);
}

