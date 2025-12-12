const NOTES = [
    // Octave 3 (Lower row)
    // Octave 3 (Lower row: ZXCVBNM,./)
    { note: 'C3', freq: 130.81, key: 'z', code: 'KeyZ', type: 'white' },
    { note: 'C#3', freq: 138.59, key: 's', code: 'KeyS', type: 'black' },
    { note: 'D3', freq: 146.83, key: 'x', code: 'KeyX', type: 'white' },
    { note: 'D#3', freq: 155.56, key: 'd', code: 'KeyD', type: 'black' },
    { note: 'E3', freq: 164.81, key: 'c', code: 'KeyC', type: 'white' },
    { note: 'F3', freq: 174.61, key: 'v', code: 'KeyV', type: 'white' },
    { note: 'F#3', freq: 185.00, key: 'g', code: 'KeyG', type: 'black' },
    { note: 'G3', freq: 196.00, key: 'b', code: 'KeyB', type: 'white' },
    { note: 'G#3', freq: 207.65, key: 'h', code: 'KeyH', type: 'black' },
    { note: 'A3', freq: 220.00, key: 'n', code: 'KeyN', type: 'white' },
    { note: 'A#3', freq: 233.08, key: 'j', code: 'KeyJ', type: 'black' },
    { note: 'B3', freq: 246.94, key: 'm', code: 'KeyM', type: 'white' },
    { note: 'C4', freq: 261.63, key: ',', code: 'Comma', type: 'white' }, // Extended
    { note: 'C#4', freq: 277.18, key: 'l', code: 'KeyL', type: 'black' }, // Extended
    { note: 'D4', freq: 293.66, key: '.', code: 'Period', type: 'white' }, // Extended
    { note: 'D#4', freq: 311.13, key: ';', code: 'Semicolon', type: 'black' }, // Extended
    { note: 'E4', freq: 329.63, key: '/', code: 'Slash', type: 'white' }, // Extended

    // Octave 4/5 (Upper row: QWERTYUIOP[])
    { note: 'C4', freq: 261.63, key: 'q', code: 'KeyQ', type: 'white' },
    { note: 'C#4', freq: 277.18, key: '2', code: 'Digit2', type: 'black' },
    { note: 'D4', freq: 293.66, key: 'w', code: 'KeyW', type: 'white' },
    { note: 'D#4', freq: 311.13, key: '3', code: 'Digit3', type: 'black' },
    { note: 'E4', freq: 329.63, key: 'e', code: 'KeyE', type: 'white' },
    { note: 'F4', freq: 349.23, key: 'r', code: 'KeyR', type: 'white' },
    { note: 'F#4', freq: 369.99, key: '5', code: 'Digit5', type: 'black' },
    { note: 'G4', freq: 392.00, key: 't', code: 'KeyT', type: 'white' },
    { note: 'G#4', freq: 415.30, key: '6', code: 'Digit6', type: 'black' },
    { note: 'A4', freq: 440.00, key: 'y', code: 'KeyY', type: 'white' },
    { note: 'A#4', freq: 466.16, key: '7', code: 'Digit7', type: 'black' },
    { note: 'B4', freq: 493.88, key: 'u', code: 'KeyU', type: 'white' },
    { note: 'C5', freq: 523.25, key: 'i', code: 'KeyI', type: 'white' },
    { note: 'C#5', freq: 554.37, key: '9', code: 'Digit9', type: 'black' },
    { note: 'D5', freq: 587.33, key: 'o', code: 'KeyO', type: 'white' },
    { note: 'D#5', freq: 622.25, key: '0', code: 'Digit0', type: 'black' },
    { note: 'E5', freq: 659.25, key: 'p', code: 'KeyP', type: 'white' },
    { note: 'F5', freq: 698.46, key: '[', code: 'BracketLeft', type: 'white' },
    { note: 'F#5', freq: 739.99, key: '-', code: 'Minus', type: 'black' },
    { note: 'G5', freq: 783.99, key: ']', code: 'BracketRight', type: 'white' },
    { note: 'G#5', freq: 830.61, key: '=', code: 'Equal', type: 'black' },
    { note: 'A5', freq: 880.00, key: '\\', code: 'Backslash', type: 'white' }
];
