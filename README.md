# 🎹 Web Synth Pro

**A powerful, browser-based polyphonic synthesizer built with the Web Audio API.**

Web Synth Pro provides a rich, tactile sound synthesis experience directly in your browser. With a sleek dark-mode interface, it offers robust features usually found in desktop VSTs, including custom wave shapes, envelope shaping (ADSR), filters, and a studio-quality effects rack.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Web%20Audio%20API-orange?style=flat-square&logo=html5)
![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205-purple?style=flat-square&logo=bootstrap)

---

## ✨ Features

### 🎛️ Core Synthesis
- **Oscillators**: Choose from Sawtooth, Square, Sine, or Triangle waves.
- **Polyphony**: Play chords with full polyphonic support, or switch to **Mono** mode with selectable note priority (Last, First, Low, High).
- **ADSR Envelope**: Precise control over Attack, Decay, Sustain, and Release for shaping sound dynamics.
- **Filter Section**: Resonant Low-Pass Filter with Cutoff and Resonance controls.

### 🎚️ Effects Rack
- **Equalizer**: 3-band EQ (Low, Mid, High) to sculpt your tone.
- **Delay**: Stereo delay with Time, Feedback, and Dry/Wet Mix controls.
- **Reverb**: Ambience/Room simulator with Size and Mix controls.

### 🎹 Advanced Tuning & Presets
- **Microtonal Scale Tuning**: Click on note names in the tuning grid (E, F#, G#, etc.) to detune them by -50 cents for Quarter-Tone scales (Maqam).
- **Preset System**: Save and load your custom patches. Includes built-in presets like "Laget" and "Shepsy".
- **Local/Offline Support**: Works seamlessly offline with automatic fallback to local resources if the CDN is unreachable.

---

## 🚀 Getting Started

### Online
Simply visit the GitHub Pages deployment (link coming soon!).

### Local Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/Web-Synth-Pro.git
    cd Web-Synth-Pro
    ```

2.  **Open `index.html`:**
    You can simply double-click `index.html` to run it in your browser.
    *Note: For the best experience, run a local server (e.g., VS Code Live Server) to ensure all audio resources load correctly.*

---

## 🛠️ Tech Stack
- **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Audio**: Web Audio API (OscillatorNode, BiquadFilterNode, GainNode, ConvolverNode, DelayNode).
- **UI Framework**: Bootstrap 5 (Dark Mode).

---

## 🤝 Contributing
Contributions are welcome! If you have ideas for new presets or features:
1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📜 License
Values customization and presets provided by the community.
Code released under the MIT License.
