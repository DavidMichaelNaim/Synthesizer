class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        this.currentSettings = {
            waveform: 'sawtooth',
            priority: 'last',
            attack: 0.1,
            decay: 0.3,
            sustain: 0.5,
            release: 1.0,
            cutoff: 2000,
            resonance: 1,
            volume: 0.5,
            poly: true,
            // Effects
            eqEnabled: true,
            delayEnabled: true,
            reverbEnabled: true,
            eqLow: 0, eqMid: 0, eqHigh: 0,
            delayTime: 0, delayFeedback: 0, delayMix: 0,
            verbTime: 2, verbMix: 0
        };

        // Note: Oriental scale detuning map (NoteName -> detuneCents)
        this.scaleDetune = {};
        this.monoNote = null;



        // Initialize Effects Chain
        this.initEffects();

        this.applySettings();
    }



    initEffects() {
        const now = this.ctx.currentTime;

        // 1. EQ (LowShelf -> Peaking -> HighShelf)
        this.eqLow = this.ctx.createBiquadFilter();
        this.eqLow.type = 'lowshelf';
        this.eqLow.frequency.value = 320;

        this.eqMid = this.ctx.createBiquadFilter();
        this.eqMid.type = 'peaking';
        this.eqMid.frequency.value = 1000;
        this.eqMid.Q.value = 1;

        this.eqHigh = this.ctx.createBiquadFilter();
        this.eqHigh.type = 'highshelf';
        this.eqHigh.frequency.value = 3200;

        // Chain EQ
        this.eqLow.connect(this.eqMid);
        this.eqMid.connect(this.eqHigh);

        // 2. Delay (Feedback Loop)
        this.delayNode = this.ctx.createDelay(5.0);
        this.delayFeedback = this.ctx.createGain();
        this.delayWet = this.ctx.createGain();
        this.delayDry = this.ctx.createGain();

        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);

        // 3. Reverb (Convolver)
        this.reverbNode = this.ctx.createConvolver();
        this.reverbWet = this.ctx.createGain();
        this.reverbDry = this.ctx.createGain();

        // Generate initial IR
        this.updateReverbImpulse(2); // 2s default

        // MASTER CHAIN WIRING
        this.delayInput = this.ctx.createGain();
        this.reverbInput = this.ctx.createGain();

        // Connect EQ to Delay Input
        this.eqHigh.connect(this.delayInput);

        // Delay internals
        this.delayInput.connect(this.delayDry); // Dry path
        this.delayInput.connect(this.delayNode); // Wet path start
        this.delayNode.connect(this.delayWet);

        // Sum Delay outputs to Reverb Input
        this.delayDry.connect(this.reverbInput);
        this.delayWet.connect(this.reverbInput);

        // Reverb internals
        this.reverbInput.connect(this.reverbDry); // Dry path
        this.reverbInput.connect(this.reverbNode); // Wet path start
        this.reverbNode.connect(this.reverbWet);

        // Connect to Master
        this.reverbDry.connect(this.masterGain);
        this.reverbWet.connect(this.masterGain);
    }

    updateReverbImpulse(duration) {
        // Simple white noise Impulse Response
        const rate = this.ctx.sampleRate;
        const length = rate * duration;
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const decay = Math.pow(1 - i / length, 2);
            left[i] = (Math.random() * 2 - 1) * decay;
            right[i] = (Math.random() * 2 - 1) * decay;
        }

        this.reverbNode.buffer = impulse;
    }

    applySettings(settings) {
        if (settings) {
            this.currentSettings = { ...this.currentSettings, ...settings };
        }
        const now = this.ctx.currentTime;
        const s = this.currentSettings;

        this.masterGain.gain.setValueAtTime(s.volume, now);

        // Apply EQ (Bypass by setting gains to 0)
        if (s.eqEnabled) {
            this.eqLow.gain.setValueAtTime(s.eqLow, now);
            this.eqMid.gain.setValueAtTime(s.eqMid, now);
            this.eqHigh.gain.setValueAtTime(s.eqHigh, now);
        } else {
            this.eqLow.gain.setValueAtTime(0, now);
            this.eqMid.gain.setValueAtTime(0, now);
            this.eqHigh.gain.setValueAtTime(0, now);
        }

        // Apply Delay
        if (s.delayEnabled) {
            const dTime = Math.max(0.01, s.delayTime);
            this.delayNode.delayTime.setValueAtTime(dTime, now);
            this.delayFeedback.gain.setValueAtTime(s.delayFeedback, now);
            this.delayDry.gain.setValueAtTime(1 - s.delayMix, now);
            this.delayWet.gain.setValueAtTime(s.delayMix, now);
        } else {
            this.delayWet.gain.setValueAtTime(0, now);
            this.delayDry.gain.setValueAtTime(1, now); // Pass through dry signal
        }

        // Apply Reverb
        if (s.reverbEnabled) {
            this.reverbDry.gain.setValueAtTime(1 - s.verbMix, now);
            this.reverbWet.gain.setValueAtTime(s.verbMix, now);
        } else {
            this.reverbWet.gain.setValueAtTime(0, now);
            this.reverbDry.gain.setValueAtTime(1, now); // Pass through dry signal
        }
    }

    setReverbTime(time) {
        this.updateReverbImpulse(time);
    }

    toggleScaleNote(noteBase) {
        if (this.scaleDetune[noteBase] === -50) {
            delete this.scaleDetune[noteBase];
            return false; // Not Active
        } else {
            this.scaleDetune[noteBase] = -50;
            return true; // Active (Detuned)
        }
    }

    resetScale() {
        this.scaleDetune = {};
    }

    playNote(frequency, noteName) {
        const now = this.ctx.currentTime;

        // Calculate Detune (Quarter Tone)
        const baseName = noteName.replace(/[0-9]/g, '');
        let detune = 0;
        if (this.scaleDetune[baseName] !== undefined) {
            detune = this.scaleDetune[baseName];
        }

        // Mono Legato: If we already have a note playing, just change frequency
        if (!this.currentSettings.poly && this.monoNote) {
            const { osc } = this.monoNote;
            // Smooth transition to avoid clicks
            osc.frequency.setTargetAtTime(frequency, now, 0.005);
            osc.detune.setTargetAtTime(detune, now, 0.005);
            return this.monoNote;
        }

        // --- COMMON NODES (Filter & Envelope) ---
        // We create these for BOTH Synth and Sampler to share the shaping architecture

        // Filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.currentSettings.cutoff, now);
        filter.Q.setValueAtTime(this.currentSettings.resonance, now);

        // Envelope Gain
        const envGain = this.ctx.createGain();
        envGain.gain.setValueAtTime(0, now);
        envGain.gain.linearRampToValueAtTime(1, now + this.currentSettings.attack);
        envGain.gain.exponentialRampToValueAtTime(
            Math.max(0.001, this.currentSettings.sustain),
            now + this.currentSettings.attack + this.currentSettings.decay
        );

        // Wiring: Source -> Filter -> Env -> Effects
        filter.connect(envGain);
        envGain.connect(this.eqLow);

        let sourceNode;

        // Standard Oscillator
        sourceNode = this.ctx.createOscillator();
        sourceNode.type = this.currentSettings.waveform;
        sourceNode.frequency.setValueAtTime(frequency, now);
        sourceNode.detune.setValueAtTime(detune, now);
        sourceNode.connect(filter);
        sourceNode.start(now);

        // Return logical object for stopNote
        const noteObj = { osc: sourceNode, envGain, filter }; // keep 'osc' name for compatibility with stopNote

        // MONO LOGIC handled by main.js requesting stopNote, but engine tracks last monoNote
        // However, if we are in Mono mode, main.js usually calls stopNote on the old key.
        // But for "Legato" (sliding) in mono, complex logic is needed.
        // For now, valid re-triggering (Retrig) is fine.

        if (!this.currentSettings.poly) {
            if (this.monoNote) this.stopNote(this.monoNote, true); // Cut previous strict
            this.monoNote = noteObj;
        }

        return noteObj;
    }

    stopNote(nodes, forceImmediate = false) {
        if (!nodes) return;
        const now = this.ctx.currentTime;
        const release = forceImmediate ? 0.05 : this.currentSettings.release;

        try {
            nodes.envGain.gain.cancelScheduledValues(now);
            nodes.envGain.gain.setValueAtTime(nodes.envGain.gain.value, now);
            nodes.envGain.gain.exponentialRampToValueAtTime(0.001, now + release);
            nodes.osc.stop(now + release + 0.1);

            if (nodes === this.monoNote) {
                this.monoNote = null;
            }
        } catch (e) { }
    }
}
