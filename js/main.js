// Imports removed for local file compatibility
// const engine = new AudioEngine(); 
// Ensure dependencies are loaded before this script in index.html

const engine = new AudioEngine();
const activeNotes = new Map(); // Poly: Key -> Nodes
const monoStack = []; // Mono: Stack of {key, freq, note}

// ================= UI INPUTS =================
// ================= UI INPUTS =================
const inputs = {
    // New Source Input
    voiceSelect: document.getElementById('voice-select'),

    waveform: document.getElementById('osc-type'),
    attack: document.getElementById('attack'),
    decay: document.getElementById('decay'),
    sustain: document.getElementById('sustain'),
    release: document.getElementById('release'),
    cutoff: document.getElementById('cutoff'),
    resonance: document.getElementById('resonance'),
    volume: document.getElementById('volume'),
    polyMode: document.getElementById('poly-mode'),
    priority: document.getElementById('mono-priority'),
    // Effects
    eqEnabled: document.getElementById('eq-enable'),
    eqLow: document.getElementById('eq-low'),
    eqMid: document.getElementById('eq-mid'),
    eqHigh: document.getElementById('eq-high'),

    delayEnabled: document.getElementById('delay-enable'),
    delayTime: document.getElementById('delay-time'),
    delayFeedback: document.getElementById('delay-feedback'),
    delayMix: document.getElementById('delay-mix'),

    reverbEnabled: document.getElementById('reverb-enable'),
    verbTime: document.getElementById('verb-time'),
    verbMix: document.getElementById('verb-mix')
};

function updateEngineSettings() {
    engine.currentSettings = {
        ...engine.currentSettings,
        waveform: inputs.waveform.value,
        priority: inputs.priority ? inputs.priority.value : 'last',
        attack: parseFloat(inputs.attack.value),
        decay: parseFloat(inputs.decay.value),
        sustain: parseFloat(inputs.sustain.value),
        release: parseFloat(inputs.release.value),
        cutoff: parseFloat(inputs.cutoff.value),
        resonance: parseFloat(inputs.resonance.value),
        volume: parseFloat(inputs.volume.value),
        // Effects
        eqEnabled: inputs.eqEnabled.checked,
        eqLow: parseFloat(inputs.eqLow.value),
        eqMid: parseFloat(inputs.eqMid.value),
        eqHigh: parseFloat(inputs.eqHigh.value),

        delayEnabled: inputs.delayEnabled.checked,
        delayTime: parseFloat(inputs.delayTime.value),
        delayFeedback: parseFloat(inputs.delayFeedback.value),
        delayMix: parseFloat(inputs.delayMix.value),

        reverbEnabled: inputs.reverbEnabled.checked,
        verbTime: parseFloat(inputs.verbTime.value),
        verbMix: parseFloat(inputs.verbMix.value)
    };
    engine.applySettings();
}

// ================= EVENT LISTENERS =================

// Standard Inputs
// Standard Inputs
Object.values(inputs).forEach(input => {
    if (!input) return;

    const handler = (e) => {
        updateValueDisplay(e.target); // From UI.js
        updateEngineSettings();
    };

    input.addEventListener('input', handler);
    input.addEventListener('change', handler); // Ensure Selects and Checkboxes update

    // Init display
    updateValueDisplay(input); // From UI.js
});

// Voice Select Listener
if (inputs.voiceSelect) {
    inputs.voiceSelect.addEventListener('change', (e) => {
        const presetKey = e.target.value;
        const preset = VOICE_PRESETS[presetKey];

        if (preset) {
            // New: Pass voice type and key to engine
            engine.currentSettings.type = preset.type || 'synth';
            engine.currentSettings.voiceKey = presetKey;
            engine.currentSettings.baseNote = preset.baseNote || 60;

            // Apply preset properties to UI inputs
            if (preset.type === 'synth') {
                inputs.waveform.value = preset.waveform;
            }

            if (preset.attack !== undefined) inputs.attack.value = preset.attack;
            if (preset.decay !== undefined) inputs.decay.value = preset.decay;
            if (preset.sustain !== undefined) inputs.sustain.value = preset.sustain;
            if (preset.release !== undefined) inputs.release.value = preset.release;
            if (preset.cutoff !== undefined) inputs.cutoff.value = preset.cutoff;
            if (preset.resonance !== undefined) inputs.resonance.value = preset.resonance;

            if (preset.poly !== undefined) {
                inputs.polyMode.checked = preset.poly;
                inputs.polyMode.dispatchEvent(new Event('change'));
            }
            if (preset.priority && inputs.priority) {
                inputs.priority.value = preset.priority;
            }

            // Update displays for all affected inputs
            [inputs.attack, inputs.decay, inputs.sustain, inputs.release, inputs.cutoff, inputs.resonance].forEach(inp => {
                updateValueDisplay(inp);
            });

            updateEngineSettings();
        }
    });
}

// Reverb Time (Regen)
if (inputs.verbTime) {
    inputs.verbTime.addEventListener('change', (e) => {
        engine.setReverbTime(parseFloat(e.target.value));
    });
}

// Poly Mode
if (inputs.polyMode) {
    inputs.polyMode.addEventListener('change', (e) => {
        const text = document.getElementById('poly-text');
        if (text) text.textContent = e.target.checked ? 'POLY' : 'MONO';
        engine.currentSettings.poly = e.target.checked;

        const pContainer = document.getElementById('priority-container');
        if (pContainer) pContainer.style.display = e.target.checked ? 'none' : 'block';

        // Reset state
        monoStack.length = 0;
        if (engine.monoNote) engine.stopNote(engine.monoNote, true);
        engine.monoNote = null;
    });
}

// Init Scale Grid (From UI.js)
// Pass engine so it can call toggleScaleNote
renderScaleGrid(engine);

document.getElementById('reset-scale').addEventListener('click', () => {
    engine.resetScale();
    renderScaleGrid(engine); // Re-render to clear active classes
});

// ================= NOTE PLAYBACK LOGIC =================

function startNote(keyChar, freq, noteName) {
    if (activeNotes.has(keyChar)) return;

    const keyEl = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (keyEl) keyEl.classList.add('active');

    engine.ctx.resume();

    if (engine.currentSettings.poly) {
        const nodes = engine.playNote(freq, noteName);
        activeNotes.set(keyChar, nodes);
    } else {
        monoStack.push({ key: keyChar, freq, note: noteName });
        updateMonoVoice();
        activeNotes.set(keyChar, true);
    }
}

function stopNote(keyChar) {
    if (!activeNotes.has(keyChar)) return;

    const keyEl = document.querySelector(`.key[data-key="${keyChar}"]`);
    if (keyEl) keyEl.classList.remove('active');

    if (engine.currentSettings.poly) {
        const nodes = activeNotes.get(keyChar);
        engine.stopNote(nodes);
        activeNotes.delete(keyChar);
    } else {
        const index = monoStack.findIndex(n => n.key === keyChar);
        if (index > -1) {
            monoStack.splice(index, 1);
            updateMonoVoice();
        }
        activeNotes.delete(keyChar);
    }
}

function updateMonoVoice() {
    if (monoStack.length > 0) {
        let targetNote;
        const mode = engine.currentSettings.priority || 'last';

        if (mode === 'last') targetNote = monoStack[monoStack.length - 1];
        else if (mode === 'first') targetNote = monoStack[0];
        else if (mode === 'low') targetNote = monoStack.reduce((p, c) => p.freq < c.freq ? p : c);
        else if (mode === 'high') targetNote = monoStack.reduce((p, c) => p.freq > c.freq ? p : c);

        if (targetNote) {
            engine.playNote(targetNote.freq, targetNote.note);
        }
    } else {
        if (engine.monoNote) {
            engine.stopNote(engine.monoNote);
        }
    }
}

// Init Keyboard UI (From UI.js)
// Pass callbacks to UI
renderKeyboard(NOTES, startNote, stopNote);

// ================= KEYBOARD EVENTS =================
const keysDown = new Set();
window.addEventListener('keydown', (e) => {
    if (keysDown.has(e.code)) return; // Strict native repeat check
    const char = e.key.toLowerCase();
    const note = NOTES.find(n => n.key === char);
    if (note) {
        keysDown.add(e.code);
        startNote(note.key, note.freq, note.note);
    }
});

window.addEventListener('keyup', (e) => {
    keysDown.delete(e.code);
    const char = e.key.toLowerCase();
    const note = NOTES.find(n => n.key === char);
    if (note) {
        stopNote(note.key);
    }
});

// ================= IMPORT / EXPORT / LOAD =================
// Init IO (From IO.js)
initIO(engine, inputs);
