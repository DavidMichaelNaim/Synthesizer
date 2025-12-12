
// ================= VISUAL / LOGIC HELPERS =================
// ================= VISUAL / LOGIC HELPERS =================
function updateValueDisplay(input) {
    let nextFn = input.nextElementSibling;
    // Check previous if next is not valid
    if (!nextFn || (!nextFn.classList.contains('value') && !nextFn.classList.contains('value-input'))) {
        nextFn = input.previousElementSibling;
    }

    if (nextFn && (nextFn.classList.contains('value') || nextFn.classList.contains('value-input'))) {
        let suffix = '';
        if (input.id === 'cutoff') suffix = 'Hz';
        else if (['attack', 'decay', 'release', 'delay-time', 'verb-time'].includes(input.id)) suffix = 's';
        else if (['volume', 'delay-mix', 'verb-mix', 'delay-feedback'].includes(input.id)) suffix = '%';
        else if (input.id.startsWith('eq-')) suffix = 'dB';

        let val = parseFloat(input.value);
        if (suffix === '%') val = Math.round(val * 100);

        if (nextFn.tagName === 'INPUT') {
            // Only update if not currently focused
            if (document.activeElement !== nextFn) {
                nextFn.value = val;
            }
        } else {
            nextFn.textContent = val + suffix;
        }
    }
}

function makeValueEditable(rangeInput) {
    let displaySpan = rangeInput.nextElementSibling;

    // Check previous sibling if next is not the value (fixes vertical sliders layout)
    if (!displaySpan || (!displaySpan.classList.contains('value') && !displaySpan.classList.contains('value-input'))) {
        displaySpan = rangeInput.previousElementSibling;
    }

    if (displaySpan && displaySpan.classList.contains('value')) {
        // Create Input
        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.className = 'value-input';
        numInput.style.width = '45px';
        numInput.style.background = 'transparent'; // Cleaner look
        numInput.style.border = 'none';
        numInput.style.borderBottom = '1px solid #444'; // Subtle underline
        numInput.style.color = 'var(--primary-color)'; // Use theme color
        numInput.style.fontSize = '0.8rem';
        numInput.style.fontWeight = 'bold';
        numInput.style.textAlign = 'center';
        numInput.style.padding = '2px 0';
        numInput.style.marginLeft = '8px';
        numInput.style.outline = 'none'; // Remove blue focus ring

        // Adjust style for vertical sliders (where span was before input)
        if (displaySpan === rangeInput.previousElementSibling) {
            numInput.style.marginLeft = '0';
            numInput.style.marginBottom = '5px';
        }

        // Focus effect
        numInput.addEventListener('focus', () => numInput.style.borderBottom = '1px solid var(--primary-color)');
        numInput.addEventListener('blur', () => numInput.style.borderBottom = '1px solid #444');

        // Initial value
        updateValueDisplay(rangeInput); // Set logic to run once to prep vars if needed, but easier to just init

        // Copy initial value from logic
        let suffix = '';
        if (rangeInput.id === 'cutoff') suffix = 'Hz';
        else if (['attack', 'decay', 'release', 'delay-time', 'verb-time'].includes(rangeInput.id)) suffix = 's';
        else if (['volume', 'delay-mix', 'verb-mix', 'delay-feedback'].includes(rangeInput.id)) suffix = '%';
        else if (rangeInput.id.startsWith('eq-')) suffix = 'dB';

        let val = parseFloat(rangeInput.value);
        if (suffix === '%') val = Math.round(val * 100);
        numInput.value = val;

        // Listener: Input -> Range
        numInput.addEventListener('change', () => {
            let newVal = parseFloat(numInput.value);
            if (isNaN(newVal)) return;

            // Handle % conversion back
            if (suffix === '%') newVal = newVal / 100;

            // Clamp
            const min = parseFloat(rangeInput.min);
            const max = parseFloat(rangeInput.max);
            if (newVal < min) newVal = min;
            if (newVal > max) newVal = max;

            rangeInput.value = newVal;
            // Trigger range change event so audio engine updates
            rangeInput.dispatchEvent(new Event('input'));
            rangeInput.dispatchEvent(new Event('change'));
        });

        // Listener: Range -> Input (handled by updateValueDisplay called from main)

        rangeInput.parentNode.replaceChild(numInput, displaySpan);
        // Important: Update standard updateValueDisplay to handle INPUT tag
    }
}

// ================= SCALE TUNING UI (GRID) =================
// 12 Semitones: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
const scaleOctave = [
    { n: 'C', t: 'white' },
    { n: 'C#', t: 'black' },
    { n: 'D', t: 'white' },
    { n: 'D#', t: 'black' },
    { n: 'E', t: 'white' },
    { n: 'F', t: 'white' },
    { n: 'F#', t: 'black' },
    { n: 'G', t: 'white' },
    { n: 'G#', t: 'black' },
    { n: 'A', t: 'white' },
    { n: 'A#', t: 'black' },
    { n: 'B', t: 'white' }
];

function renderScaleGrid(engine) {
    const container = document.getElementById('scale-controls');
    if (!container) return;
    container.innerHTML = '';

    scaleOctave.forEach(n => {
        const btn = document.createElement('div');
        btn.className = `scale-btn ${n.t}`;
        // Map G# to 'G#' (which is what engine calls it)
        // Note: engine.toggleScaleNote expects note name like 'C', 'C#', etc.
        btn.textContent = n.n;

        // Initial state check
        if (engine.scaleDetune[n.n] === -50) btn.classList.add('active');

        btn.addEventListener('click', () => {
            const active = engine.toggleScaleNote(n.n);
            if (active) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        container.appendChild(btn);
    });
}

function renderKeyboard(notes, startNoteCallback, stopNoteCallback) {
    const keyboardDiv = document.getElementById('keyboard');
    if (!keyboardDiv) return;

    keyboardDiv.innerHTML = '';

    // Create wrapper for keys to ensure correct absolute positioning context
    const keysWrapper = document.createElement('div');
    keysWrapper.className = 'keys-wrapper';

    let whiteKeyIndex = 0;

    // Deduplicate notes for visual rendering
    // We want all the keyboard bindings to work (in NOTES), but only one visual key per pitch.
    const uniqueNotes = [];
    const seenMap = new Map();

    notes.forEach(n => {
        if (!seenMap.has(n.note)) {
            uniqueNotes.push({ ...n });
            seenMap.set(n.note, uniqueNotes.length - 1);
        } else {
            const index = seenMap.get(n.note);
            uniqueNotes[index].key += ' / ' + n.key;
        }
    });

    uniqueNotes.forEach((n, i) => {
        const key = document.createElement('div');
        key.className = `key ${n.type}`;
        key.dataset.note = n.note;
        key.dataset.key = n.code; // Use Code for ID

        if (n.type === 'white') {
            const noteName = document.createElement('span');
            // Show only Note Letter (e.g. 'C' from 'C3')
            noteName.textContent = n.note.replace(/[0-9]/g, '');
            noteName.style.fontSize = '0.75rem';
            noteName.style.color = '#555';
            noteName.style.fontWeight = 'bold';
            key.appendChild(noteName);

            whiteKeyIndex++;
        } else {
            // Black keys usually don't have text on synth UIs, usually empty
            // But if we want note name:
            /*
            const noteName = document.createElement('span');
            noteName.textContent = n.note.replace(/[0-9]/g, '');
            noteName.style.fontSize = '0.5rem';
            noteName.style.color = '#ccc';
            key.appendChild(noteName);
            */

            // Add position class
            key.classList.add(`black-pos-${whiteKeyIndex}`);
        }

        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startNoteCallback(n.code, n.freq, n.note); // Pass Code
        });
        key.addEventListener('mouseup', () => stopNoteCallback(n.code));
        key.addEventListener('mouseleave', () => stopNoteCallback(n.code));

        keysWrapper.appendChild(key);
    });

    keyboardDiv.appendChild(keysWrapper);
}
