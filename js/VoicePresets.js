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
