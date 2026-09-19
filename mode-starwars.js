// Star Wars global state
var starWarsGroups = [];
var starWarsCurrentGroup = 0;
var starWarsAnimationFrame = null;
var starWarsOffset = 0;
var starWarsScrollSpeed = 0;
var starWarsTotalHeight = 0;
var starWarsTotalDistance = 0;
var starWarsTotalDuration = 0;
var starWarsContentHeight = 0;
var starWarsViewportHeight = 0;
var starWarsElapsedBeforePause = 0;
var starWarsStartTime = 0;
var starWarsLastFrameTime = 0;
var starWarsInitialOffset = 0;
var starWarsCenterOffset = 0;
var starWarsFinalOffset = 0;
var starWarsFadeOutDuration = 1000;
var starWarsTotalDurationWithFade = 0;
var starWarsPhase = '';
var starWarsPhaseStartTime = 0;
var starWarsCountdownDuration = 3000;
var starWarsPreScrollDuration = 2500;

function splitStarWarsGroups(text) {
    var allWords = text.trim().split(/\s+/).filter(function(w) { return w.length > 0; });
    if (allWords.length === 0) {
        return [];
    }
    if (allWords.length <= 3) {
        return [allWords.join(' ')];
    }

    var maxChars = 25;
    var minChars = 10;
    var maxWords = 5;
    var groups = [];
    var current = [];

    for (var i = 0; i < allWords.length; i++) {
        var word = allWords[i];
        var testLen = current.length > 0 ? current.join(' ').length + 1 + word.length : word.length;

        if (current.length > 0 && (testLen > maxChars || current.length >= maxWords)) {
            groups.push(current.join(' '));
            current = [];
        }

        current.push(word);

        if (/[.!?]$/.test(current[current.length - 1]) && current.length >= 2) {
            groups.push(current.join(' '));
            current = [];
        } else if (/[,;]$/.test(current[current.length - 1]) && current.length >= 2) {
            groups.push(current.join(' '));
            current = [];
        }
    }

    if (current.length > 0) {
        groups.push(current.join(' '));
    }

    var merged = [];
    for (var i = 0; i < groups.length; i++) {
        var groupLen = groups[i].length;
        if (groupLen < minChars && merged.length > 0) {
            var potential = merged[merged.length - 1] + ' ' + groups[i];
            if (potential.length <= maxChars + 10) {
                merged[merged.length - 1] = potential;
            } else {
                merged.push(groups[i]);
            }
        } else if (groupLen < minChars && i + 1 < groups.length) {
            var potential = groups[i] + ' ' + groups[i + 1];
            if (potential.length <= maxChars + 10) {
                merged.push(potential);
                i++;
            } else {
                merged.push(groups[i]);
            }
        } else {
            merged.push(groups[i]);
        }
    }

    return merged;
}

function getStarWarsDuration(wordCount, speed) {
    if (!wordCount || !speed || speed <= 0) {
        return 0;
    }
    return (wordCount / speed) * 60000;
}

function nowMs() {
    if (window.performance && window.performance.now) {
        return window.performance.now();
    }
    return Date.now();
}

function requestStarWarsFrame(callback) {
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame(callback);
    }
    return setTimeout(function() {
        callback(nowMs());
    }, 16);
}

function cancelStarWarsFrame(frameId) {
    if (frameId === null || frameId === undefined) {
        return;
    }
    if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(frameId);
    } else {
        clearTimeout(frameId);
    }
}

function showCountdownNumber(number) {
    var existing = document.querySelector('.countdown-number');
    if (existing) existing.remove();
    
    var el = document.createElement('div');
    el.className = 'countdown-number';
    el.textContent = number;
    document.body.appendChild(el);
}

function hideCountdownNumber() {
    var existing = document.querySelector('.countdown-number');
    if (existing) existing.remove();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderStarWarsDisplay() {
    var text = getInputText();
    starWarsGroups = splitStarWarsGroups(text);
    starWarsCurrentGroup = 0;

    if (starWarsGroups.length === 0) {
        wordDisplay.innerHTML = '<span>Prepara tu texto</span>';
        return;
    }

    var html = '';
    for (var i = 0; i < starWarsGroups.length; i++) {
        html += '<div class="starwars-chunk">' + escapeHtml(starWarsGroups[i]) + '</div>';
    }

    wordDisplay.className = 'word-display starwars-display';
    document.body.classList.add('starwars-bg');
    wordDisplay.innerHTML = '<div class="starwars-scroller"><div class="starwars-content">' + html + '</div></div>';

    var scroller = wordDisplay.querySelector('.starwars-scroller');
    var content = wordDisplay.querySelector('.starwars-content');
    var viewportHeight = wordDisplay.clientHeight > 0 ? wordDisplay.clientHeight : window.innerHeight;
    if (viewportHeight === 0) viewportHeight = window.innerHeight;
    var contentHeight = content.offsetHeight > 0 ? content.offsetHeight : content.scrollHeight;
    if (!contentHeight || contentHeight < 100) {
        contentHeight = starWarsGroups.length * 96;
    }

    starWarsViewportHeight = viewportHeight;
    starWarsContentHeight = contentHeight;
    starWarsTotalHeight = contentHeight;

    // Key positions: offset = -translateY
    // Initial: content BELOW screen (negative offset = content up)
    starWarsInitialOffset = -(viewportHeight + contentHeight);
    // Center (start reading): first chunk centered
    starWarsCenterOffset = -viewportHeight / 2;
    // Final: last chunk centered
    starWarsFinalOffset = contentHeight - viewportHeight / 2;

    starWarsTotalDistance = starWarsFinalOffset - starWarsCenterOffset;
    starWarsTotalDuration = getStarWarsDuration(words.length, wpm);
    var finalPauseMs = Math.max(1500, 3500 * 250 / wpm);
    starWarsTotalDuration += finalPauseMs;
    starWarsFadeOutDuration = 1000;
    starWarsTotalDurationWithFade = starWarsTotalDuration + starWarsFadeOutDuration;
    starWarsScrollSpeed = starWarsTotalDuration > 0 ? starWarsTotalDistance / starWarsTotalDuration : 0;

    // Initial position: BELOW screen
    starWarsOffset = starWarsInitialOffset;

    if (scroller) {
        // Force initial position with !important-like specificity
        scroller.style.setProperty('transform', 'translateY(' + (-starWarsOffset) + 'px)', 'important');
        // Force synchronous layout
        scroller.offsetHeight;
        // Double-check
        if (scroller.style.transform.indexOf(-starWarsOffset) === -1) {
            scroller.style.transform = 'translateY(' + (-starWarsOffset) + 'px)';
        }
    }
}

function startStarWarsAnimation() {
    cancelStarWarsFrame(starWarsAnimationFrame);
    starWarsAnimationFrame = null;
    starWarsElapsedBeforePause = 0;
    starWarsStartTime = nowMs();
    
    // Ensure initial position is set
    var scroller = wordDisplay.querySelector('.starwars-scroller');
    if (scroller) {
        scroller.style.transform = 'translateY(' + (-starWarsInitialOffset) + 'px)';
        scroller.offsetHeight;
    }
    
    // Start animation on next frame to ensure initial position is painted
    starWarsAnimationFrame = requestStarWarsFrame(function(timestamp) {
        starWarsStartTime = timestamp || nowMs();
        starWarsAnimationFrame = requestStarWarsFrame(animateStarWars);
    });
}

function animateStarWars(timestamp) {
    if (!isRunning || isPaused) {
        return;
    }

    if (!starWarsStartTime) {
        starWarsStartTime = timestamp || nowMs();
    }

    var now = timestamp || nowMs();
    var elapsed = starWarsElapsedBeforePause + Math.max(0, now - starWarsStartTime);
    var totalDistance = starWarsFinalOffset - starWarsCenterOffset;

    var scroller = wordDisplay.querySelector('.starwars-scroller');
    var content = wordDisplay.querySelector('.starwars-content');

    // Phase 1: Scroll animation
    if (elapsed < starWarsTotalDuration) {
        var progress = starWarsTotalDuration > 0 ? Math.min(1, elapsed / starWarsTotalDuration) : 1;
        starWarsOffset = starWarsCenterOffset + totalDistance * progress;
        starWarsCurrentGroup = Math.min(starWarsGroups.length - 1, Math.floor(progress * starWarsGroups.length));
    } else if (elapsed < starWarsTotalDurationWithFade) {
        // Phase 2: Fade out
        var fadeProgress = (elapsed - starWarsTotalDuration) / starWarsFadeOutDuration;
        if (scroller) {
            scroller.style.transform = 'translateY(' + (-starWarsFinalOffset) + 'px)';
        }
        if (content) {
            content.style.opacity = 1 - fadeProgress;
        }
        starWarsAnimationFrame = requestStarWarsFrame(animateStarWars);
        return;
    } else {
        // Complete
        finishReading();
        return;
    }

    if (scroller) {
        scroller.style.transform = 'translateY(' + (-starWarsOffset) + 'px)';
    }

    starWarsAnimationFrame = requestStarWarsFrame(animateStarWars);
}

function pauseStarWars() {
    if (starWarsAnimationFrame !== null) {
        cancelStarWarsFrame(starWarsAnimationFrame);
        starWarsAnimationFrame = null;
    }
    if (starWarsStartTime) {
        starWarsElapsedBeforePause += Math.max(0, nowMs() - starWarsStartTime);
        starWarsStartTime = 0;
    }
}

function resumeStarWars() {
    if (!isRunning || starWarsGroups.length === 0) {
        return;
    }
    starWarsStartTime = nowMs();
    starWarsAnimationFrame = requestStarWarsFrame(animateStarWars);
}

function clearStarWarsPresentation() {
    cancelStarWarsFrame(starWarsAnimationFrame);
    hideCountdownNumber();
    starWarsAnimationFrame = null;
    starWarsOffset = 0;
    starWarsScrollSpeed = 0;
    starWarsTotalHeight = 0;
    starWarsTotalDistance = 0;
    starWarsTotalDuration = 0;
    starWarsContentHeight = 0;
    starWarsViewportHeight = 0;
    starWarsElapsedBeforePause = 0;
    starWarsStartTime = 0;
    starWarsLastFrameTime = 0;
    starWarsPhase = '';
    starWarsPhaseStartTime = 0;
    starWarsCountdownDuration = 0;
    starWarsPreScrollDuration = 0;
    starWarsGroups = [];
    starWarsCurrentGroup = 0;
    wordDisplay.classList.remove('starwars-display', 'starwars-active');
    document.body.classList.remove('starwars-bg');
    wordDisplay.style.background = '';
    wordDisplay.style.overflow = '';
    wordDisplay.style.position = '';
    wordDisplay.style.zIndex = '';
    wordDisplay.style.perspective = '';
}

function updateStarWarsTimer() {
    // Star Wars uses continuous scroll, timer already shown via updateTimer
}
