
// ================= VISUAL / LOGIC HELPERS =================
function updateValueDisplay(input) {
    const nextFn = input.nextElementSibling;
    if (nextFn && nextFn.classList.contains('value')) {
        let suffix = '';
        if (input.id === 'cutoff') suffix = 'Hz';
        else if (['attack', 'decay', 'release', 'delay-time', 'verb-time'].includes(input.id)) suffix = 's';
        else if (['volume', 'delay-mix', 'verb-mix', 'delay-feedback'].includes(input.id)) suffix = '%';
        else if (input.id.startsWith('eq-')) suffix = 'dB';

        let val = parseFloat(input.value);
        if (suffix === '%') val = Math.round(val * 100);

        nextFn.textContent = val + suffix;
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

    notes.forEach((n, i) => {
        const key = document.createElement('div');
        key.className = `key ${n.type}`;
        key.dataset.note = n.note;
        key.dataset.key = n.key;

        if (n.type === 'white') {
            const noteName = document.createElement('span');
            noteName.textContent = n.note;
            noteName.style.fontSize = '0.65rem';
            noteName.style.color = '#777';
            key.appendChild(noteName);

            const hint = document.createElement('span');
            hint.className = 'key-hint';
            hint.textContent = n.key.toUpperCase();
            key.appendChild(hint);

            whiteKeyIndex++;
        } else {
            const hint = document.createElement('span');
            hint.className = 'key-hint';
            hint.textContent = n.key.toUpperCase();
            hint.style.color = '#999';
            hint.style.fontSize = '0.55rem';
            key.appendChild(hint);

            // Add position class
            key.classList.add(`black-pos-${whiteKeyIndex}`);
        }

        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startNoteCallback(n.key, n.freq, n.note);
        });
        key.addEventListener('mouseup', () => stopNoteCallback(n.key));
        key.addEventListener('mouseleave', () => stopNoteCallback(n.key));

        keysWrapper.appendChild(key);
    });

    keyboardDiv.appendChild(keysWrapper);
}
