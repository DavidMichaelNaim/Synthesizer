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
    wahEnabled: document.getElementById('wah-enable'),
    wahRate: document.getElementById('wah-rate'),
    wahDepth: document.getElementById('wah-depth'),
    wahQ: document.getElementById('wah-q'),

    distEnabled: document.getElementById('dist-enable'),
    distDrive: document.getElementById('dist-drive'),
    distMix: document.getElementById('dist-mix'),

    tremEnabled: document.getElementById('trem-enable'),
    tremRate: document.getElementById('trem-rate'),
    tremDepth: document.getElementById('trem-depth'),

    eqEnabled: document.getElementById('eq-enable'),
    eqLow: document.getElementById('eq-low'),
    eqMid: document.getElementById('eq-mid'),
    eqHigh: document.getElementById('eq-high'),

    phaserEnabled: document.getElementById('phaser-enable'),
    phaserRate: document.getElementById('phaser-rate'),
    phaserDepth: document.getElementById('phaser-depth'),
    phaserFeedback: document.getElementById('phaser-feedback'),

    chorusEnabled: document.getElementById('chorus-enable'),
    chorusRate: document.getElementById('chorus-rate'),
    chorusDepth: document.getElementById('chorus-depth'),
    chorusMix: document.getElementById('chorus-mix'),

    delayEnabled: document.getElementById('delay-enable'),
    delayTime: document.getElementById('delay-time'),
    delayFeedback: document.getElementById('delay-feedback'),
    delayMix: document.getElementById('delay-mix'),

    reverbEnabled: document.getElementById('reverb-enable'),
    verbTime: document.getElementById('verb-time'),
    verbMix: document.getElementById('verb-mix'),

    compThreshold: document.getElementById('comp-threshold'),
    compRatio: document.getElementById('comp-ratio'),
    compAttack: document.getElementById('comp-attack'),
    compRelease: document.getElementById('comp-release')
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
        // Effects - Defensive Checks for ALL
        wahEnabled: inputs.wahEnabled ? inputs.wahEnabled.checked : false,
        wahRate: inputs.wahRate ? parseFloat(inputs.wahRate.value) : 0,
        wahDepth: inputs.wahDepth ? parseFloat(inputs.wahDepth.value) : 0,
        wahQ: inputs.wahQ ? parseFloat(inputs.wahQ.value) : 1,

        distEnabled: inputs.distEnabled ? inputs.distEnabled.checked : false,
        distDrive: inputs.distDrive ? parseFloat(inputs.distDrive.value) : 0,
        distMix: inputs.distMix ? parseFloat(inputs.distMix.value) : 0,

        tremEnabled: inputs.tremEnabled ? inputs.tremEnabled.checked : false,
        tremRate: inputs.tremRate ? parseFloat(inputs.tremRate.value) : 0,
        tremDepth: inputs.tremDepth ? parseFloat(inputs.tremDepth.value) : 0,

        eqEnabled: inputs.eqEnabled ? inputs.eqEnabled.checked : false,
        eqLow: inputs.eqLow ? parseFloat(inputs.eqLow.value) : 0,
        eqMid: inputs.eqMid ? parseFloat(inputs.eqMid.value) : 0,
        eqHigh: inputs.eqHigh ? parseFloat(inputs.eqHigh.value) : 0,

        phaserEnabled: inputs.phaserEnabled ? inputs.phaserEnabled.checked : false,
        phaserRate: inputs.phaserRate ? parseFloat(inputs.phaserRate.value) : 0,
        phaserDepth: inputs.phaserDepth ? parseFloat(inputs.phaserDepth.value) : 0,
        phaserFeedback: inputs.phaserFeedback ? parseFloat(inputs.phaserFeedback.value) : 0,

        chorusEnabled: inputs.chorusEnabled ? inputs.chorusEnabled.checked : false,
        chorusRate: inputs.chorusRate ? parseFloat(inputs.chorusRate.value) : 0,
        chorusDepth: inputs.chorusDepth ? parseFloat(inputs.chorusDepth.value) : 0,
        chorusMix: inputs.chorusMix ? parseFloat(inputs.chorusMix.value) : 0,

        delayEnabled: inputs.delayEnabled ? inputs.delayEnabled.checked : false,
        delayTime: inputs.delayTime ? parseFloat(inputs.delayTime.value) : 0,
        delayFeedback: inputs.delayFeedback ? parseFloat(inputs.delayFeedback.value) : 0,
        delayMix: inputs.delayMix ? parseFloat(inputs.delayMix.value) : 0,

        reverbEnabled: inputs.reverbEnabled ? inputs.reverbEnabled.checked : false,
        verbTime: inputs.verbTime ? parseFloat(inputs.verbTime.value) : 0,
        verbMix: inputs.verbMix ? parseFloat(inputs.verbMix.value) : 0,

        compThreshold: inputs.compThreshold ? parseFloat(inputs.compThreshold.value) : -24,
        compRatio: inputs.compRatio ? parseFloat(inputs.compRatio.value) : 12,
        compAttack: inputs.compAttack ? parseFloat(inputs.compAttack.value) : 0.003,
        compRelease: inputs.compRelease ? parseFloat(inputs.compRelease.value) : 0.25
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
    const presetSelect = document.getElementById('osc-preset-select');
    const presetContainer = document.getElementById('osc-preset-container');

    // Helper to toggle preset container visibility
    const updatePresetVisibility = (val) => {
        if (presetContainer) {
            presetContainer.style.display = (val === 'custom') ? 'block' : 'none';
        }
    };

    // Initial check
    updatePresetVisibility(inputs.voiceSelect.value);

    inputs.voiceSelect.addEventListener('change', (e) => {
        const presetKey = e.target.value;
        const preset = VOICE_PRESETS[presetKey];

        updatePresetVisibility(presetKey);

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

            // Apply Effects Settings from preset
            if (preset.settings) {
                const s = preset.settings;

                // Distortion
                if (s.distEnabled !== undefined) inputs.distEnabled.checked = s.distEnabled;
                if (s.distDrive !== undefined) inputs.distDrive.value = s.distDrive;
                if (s.distMix !== undefined) inputs.distMix.value = s.distMix;

                // EQ
                if (s.eqEnabled !== undefined) inputs.eqEnabled.checked = s.eqEnabled;
                if (s.eqLow !== undefined) inputs.eqLow.value = s.eqLow;
                if (s.eqMid !== undefined) inputs.eqMid.value = s.eqMid;
                if (s.eqHigh !== undefined) inputs.eqHigh.value = s.eqHigh;

                // Chorus
                if (s.chorusEnabled !== undefined) inputs.chorusEnabled.checked = s.chorusEnabled;
                if (s.chorusRate !== undefined) inputs.chorusRate.value = s.chorusRate;
                if (s.chorusDepth !== undefined) inputs.chorusDepth.value = s.chorusDepth;
                if (s.chorusMix !== undefined) inputs.chorusMix.value = s.chorusMix;

                // Delay
                if (s.delayEnabled !== undefined) inputs.delayEnabled.checked = s.delayEnabled;
                if (s.delayTime !== undefined) inputs.delayTime.value = s.delayTime;
                if (s.delayFeedback !== undefined) inputs.delayFeedback.value = s.delayFeedback;
                if (s.delayMix !== undefined) inputs.delayMix.value = s.delayMix;

                // Reverb
                if (s.reverbEnabled !== undefined) inputs.reverbEnabled.checked = s.reverbEnabled;
                if (s.verbTime !== undefined) inputs.verbTime.value = s.verbTime;
                if (s.verbMix !== undefined) inputs.verbMix.value = s.verbMix;

                // Update all effect displays
                [
                    inputs.distDrive, inputs.distMix,
                    inputs.eqLow, inputs.eqMid, inputs.eqHigh,
                    inputs.chorusRate, inputs.chorusDepth, inputs.chorusMix,
                    inputs.delayTime, inputs.delayFeedback, inputs.delayMix,
                    inputs.verbTime, inputs.verbMix
                ].forEach(inp => {
                    if (inp) updateValueDisplay(inp);
                });
            }

            // Apply scale if present
            if (preset.scale) {
                engine.scaleDetune = preset.scale;
                if (typeof renderScaleGrid === 'function') renderScaleGrid(engine);
            }

            // Update displays for all affected inputs
            [inputs.attack, inputs.decay, inputs.sustain, inputs.release, inputs.cutoff, inputs.resonance].forEach(inp => {
                updateValueDisplay(inp);
            });

            updateEngineSettings();
        }
    });

    // Oscillator Preset Listener
    if (presetSelect) {
        // Refill Dropdown Dynamically
        const populateOscPresets = () => {
            presetSelect.innerHTML = '<option value="" disabled selected>Select Preset</option>';
            Object.keys(OSC_PRESETS).forEach(key => {
                const p = OSC_PRESETS[key];
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = p.name || key;
                presetSelect.appendChild(opt);
            });
        };
        populateOscPresets();

        presetSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            const presetData = OSC_PRESETS[key];

            if (presetData && presetData.settings) {
                const s = presetData.settings;

                // Apply Params
                if (s.waveform) inputs.waveform.value = s.waveform;
                if (s.poly !== undefined) {
                    inputs.polyMode.checked = s.poly;
                    inputs.polyMode.dispatchEvent(new Event('change'));
                }
                if (s.priority) inputs.priority.value = s.priority;

                if (s.attack !== undefined) inputs.attack.value = s.attack;
                if (s.decay !== undefined) inputs.decay.value = s.decay;
                if (s.sustain !== undefined) inputs.sustain.value = s.sustain;
                if (s.release !== undefined) inputs.release.value = s.release;
                if (s.cutoff !== undefined) inputs.cutoff.value = s.cutoff;
                if (s.resonance !== undefined) inputs.resonance.value = s.resonance;
                if (s.volume !== undefined) inputs.volume.value = s.volume;

                // Effects
                // Auto-Wah
                if (s.wahEnabled !== undefined) inputs.wahEnabled.checked = s.wahEnabled;
                if (s.wahRate !== undefined) inputs.wahRate.value = s.wahRate;
                if (s.wahDepth !== undefined) inputs.wahDepth.value = s.wahDepth;
                if (s.wahQ !== undefined) inputs.wahQ.value = s.wahQ;

                // Distortion
                if (s.distEnabled !== undefined) inputs.distEnabled.checked = s.distEnabled;
                if (s.distDrive !== undefined) inputs.distDrive.value = s.distDrive;
                if (s.distMix !== undefined) inputs.distMix.value = s.distMix;

                // Tremolo
                if (s.tremEnabled !== undefined) inputs.tremEnabled.checked = s.tremEnabled;
                if (s.tremRate !== undefined) inputs.tremRate.value = s.tremRate;
                if (s.tremDepth !== undefined) inputs.tremDepth.value = s.tremDepth;

                // EQ
                if (s.eqEnabled !== undefined) inputs.eqEnabled.checked = s.eqEnabled;
                if (s.eqLow !== undefined) inputs.eqLow.value = s.eqLow;
                if (s.eqMid !== undefined) inputs.eqMid.value = s.eqMid;
                if (s.eqHigh !== undefined) inputs.eqHigh.value = s.eqHigh;

                // Phaser
                if (s.phaserEnabled !== undefined) inputs.phaserEnabled.checked = s.phaserEnabled;
                if (s.phaserRate !== undefined) inputs.phaserRate.value = s.phaserRate;
                if (s.phaserDepth !== undefined) inputs.phaserDepth.value = s.phaserDepth;
                if (s.phaserFeedback !== undefined) inputs.phaserFeedback.value = s.phaserFeedback;

                // Chorus
                if (s.chorusEnabled !== undefined) inputs.chorusEnabled.checked = s.chorusEnabled;
                if (s.chorusRate !== undefined) inputs.chorusRate.value = s.chorusRate;
                if (s.chorusDepth !== undefined) inputs.chorusDepth.value = s.chorusDepth;
                if (s.chorusMix !== undefined) inputs.chorusMix.value = s.chorusMix;

                if (s.eqEnabled !== undefined) inputs.eqEnabled.checked = s.eqEnabled;
                if (s.eqLow !== undefined) inputs.eqLow.value = s.eqLow;
                if (s.eqMid !== undefined) inputs.eqMid.value = s.eqMid;
                if (s.eqHigh !== undefined) inputs.eqHigh.value = s.eqHigh;

                if (s.delayEnabled !== undefined) inputs.delayEnabled.checked = s.delayEnabled;
                if (s.delayTime !== undefined) inputs.delayTime.value = s.delayTime;
                if (s.delayFeedback !== undefined) inputs.delayFeedback.value = s.delayFeedback;
                if (s.delayMix !== undefined) inputs.delayMix.value = s.delayMix;

                if (s.reverbEnabled !== undefined) inputs.reverbEnabled.checked = s.reverbEnabled;
                if (s.verbTime !== undefined) inputs.verbTime.value = s.verbTime;
                if (s.verbMix !== undefined) inputs.verbMix.value = s.verbMix;

                // Update Visuals
                Object.values(inputs).forEach(inp => {
                    if (inp && inp.tagName === 'INPUT') updateValueDisplay(inp);
                });

                updateEngineSettings();
            }

            // Apply Scale
            if (presetData && presetData.scale) {
                engine.resetScale();
                const scale = presetData.scale;
                Object.keys(scale).forEach(note => {
                    if (scale[note] === -50) {
                        engine.toggleScaleNote(note);
                    }
                });
                renderScaleGrid(engine);
            }
        });
    }
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

    // Visual: Select by Note Name (handles multiple keys for same note)
    const keyEl = document.querySelector(`.key[data-note="${noteName}"]`);
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

    // We need noteName to find the visual element. 
    // We can rely on activeNotes if we stored it, or find it from NOTES. 
    // But wait, keyChar (Code) is unique in NOTES.
    const noteDef = NOTES.find(n => n.code === keyChar);
    if (noteDef) {
        // Visual
        const keyEl = document.querySelector(`.key[data-note="${noteDef.note}"]`);
        // Only remove active if no other keys for this note are pressed?
        // Actually, simpler: just remove it. 
        // If I hold Q and Comma, and release Q, visual might turn off?
        // Ideally we check if any other active key maps to this note.
        if (keyEl) {
            // Check if any other pressed key maps to this note
            const stillPressed = Array.from(activeNotes.keys()).some(k =>
                k !== keyChar && NOTES.find(n => n.code === k)?.note === noteDef.note
            );
            if (!stillPressed) keyEl.classList.remove('active');
        }
    }

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
    if (e.repeat) return; // Strict native repeat check
    const code = e.code;
    const note = NOTES.find(n => n.code === code);
    if (note) {
        if (!keysDown.has(code)) {
            keysDown.add(code);
            startNote(note.code, note.freq, note.note);
        }
    }
});

window.addEventListener('keyup', (e) => {
    const code = e.code;
    if (keysDown.has(code)) {
        keysDown.delete(code);
        const note = NOTES.find(n => n.code === code);
        if (note) {
            stopNote(note.code);
        }
    }
});

// ================= IMPORT / EXPORT / LOAD =================
// Init IO (From IO.js)
initIO(engine, inputs);

// Setup Editable Values
document.querySelectorAll('input[type="range"]').forEach(range => {
    makeValueEditable(range);
    updateValueDisplay(range); // Init display
});
