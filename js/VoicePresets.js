const VOICE_PRESETS = {
    custom: {
        name: "Custom (Oscillator)",
        description: "Standard analog-style oscillator where you select the shape.",
        type: "synth", // 'synth' or 'sampler'
        waveform: "sawtooth",
        poly: true,
        priority: "last",
        attack: 0.1,
        decay: 0.3,
        sustain: 0.5,
        release: 1.0,
        cutoff: 2000,
        resonance: 1
    }
};

const OSC_PRESETS = {
    laget: {
        name: "Laget",
        settings: {
            waveform: "sawtooth",
            poly: false,
            priority: "last",
            attack: 0.05,
            decay: 0,
            sustain: 1,
            release: 0.1,
            cutoff: 8000,
            resonance: 4,
            volume: 0.06,
            // Effects
            eqEnabled: true,
            eqLow: 15,
            eqMid: 20,
            eqHigh: 8,
            delayEnabled: true,
            delayTime: 0.31,
            delayFeedback: 0.05,
            delayMix: 0.19,
            reverbEnabled: true,
            verbTime: 2,
            verbMix: 0.31
        },
        scale: {
            "E": -50,
            "F#": -50,
            "G#": -50,
            "B": -50
        }
    },
    shepsy: {
        name: "shepsy",
        settings: {
            "waveform": "square",
            "priority": "last",
            "attack": 0.05,
            "decay": 0,
            "sustain": 1,
            "release": 0.1,
            "cutoff": 7500,
            "resonance": 0,
            "volume": 0.05,
            "poly": false,
            "eqEnabled": true,
            "delayEnabled": true,
            "reverbEnabled": true,
            "eqLow": 20,
            "eqMid": 20,
            "eqHigh": 5,
            "delayTime": 0.31,
            "delayFeedback": 0.05,
            "delayMix": 0.19,
            "verbTime": 2,
            "verbMix": 0.31,
            "distEnabled": false,
            "distDrive": 1,
            "distMix": 1,
            "chorusEnabled": true,
            "chorusRate": 4.6,
            "chorusDepth": 0.04,
            "chorusMix": 1
        },
        scale: {
            "E": -50,
            "F#": -50,
            "G#": -50,
            "B": -50
        }
    }
};
