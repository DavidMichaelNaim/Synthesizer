
// ================= IMPORT / EXPORT / LOAD =================

function getCurrentState(engine) {
    return {
        settings: engine.currentSettings,
        scale: engine.scaleDetune
    };
}

function loadPreset(data, engine, inputs) {
    try {
        const settings = data.settings || data;
        const scale = data.scale || {};

        engine.applySettings(settings);
        engine.scaleDetune = scale;

        // Apply to UI
        Object.keys(inputs).forEach(k => {
            // Special mapping for keys that differ between Settings and Inputs
            let settingKey = k;
            if (k === 'polyMode') settingKey = 'poly';

            if (inputs[k] && settings[settingKey] !== undefined) {
                inputs[k].value = settings[settingKey];

                // Checkboxes
                if (inputs[k].type === 'checkbox') {
                    inputs[k].checked = settings[settingKey];
                }

                // Refresh visual values if function exists (Global scope from UI.js)
                if (typeof updateValueDisplay === 'function') updateValueDisplay(inputs[k]);
            }
        });

        // Poly Trigger (to update UI text/visibility)
        if (inputs.polyMode) inputs.polyMode.dispatchEvent(new Event('change'));

        // Scale UI Refresh
        // Re-render to show active states
        if (typeof renderScaleGrid === 'function') renderScaleGrid(engine);

    } catch (err) { console.error(err); }
}

function initIO(engine, inputs) {
    const saveBtn = document.getElementById('save-btn');
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-file');

    if (saveBtn) saveBtn.addEventListener('click', () => {
        localStorage.setItem('synth-preset', JSON.stringify(getCurrentState(engine)));
        alert('Saved to Browser');
    });

    if (exportBtn) exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(getCurrentState(engine), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'synth-preset.json';
        a.click();
    });

    if (importInput) importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => loadPreset(JSON.parse(ev.target.result), engine, inputs);
        reader.readAsText(file);
    });

    // Auto Load
    const s = localStorage.getItem('synth-preset');
    if (s) loadPreset(JSON.parse(s), engine, inputs);
}
