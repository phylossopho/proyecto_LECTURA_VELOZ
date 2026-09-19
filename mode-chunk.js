function renderChunkDisplay() {
    if (chunks.length === 0) {
        wordDisplay.innerHTML = '<span>Sin texto</span>';
        return;
    }

    var chunkData = chunks[currentChunk];
    var chunkWords = chunkData.words;
    var html = '<div class="chunk-box">';

    for (var i = 0; i < chunkWords.length; i++) {
        var word = cleanWord(chunkWords[i]);
        html += '<span class="chunk-word">' + word + '</span>';
    }

    html += '</div>';

    var endType = chunkData.endsWith;
    chunkPauseMs = getPauseForEndType(endType);

    wordDisplay.className = 'word-display chunk-mode fade-in';
    wordDisplay.innerHTML = html;
}


function scheduleChunkNext() {
    var pauseScale = Math.max(0.5, 250 / wpm);
    var scaledPause = Math.round(chunkPauseMs * pauseScale);
    scheduleTimeout = setTimeout(function() {
        if (isRunning && !isPaused) {
            currentChunk++;
            if (currentChunk >= chunks.length) {
                finishReading();
                return;
            }
            renderChunkDisplay();
            scheduleChunkNext();
        }
    }, scaledPause + (60 / wpm) * 1000 * chunkSize * 0.3);
}

