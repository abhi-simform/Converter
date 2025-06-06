# MKV to MP4 Video Converter

A modern React TypeScript application for fast MKV to MP4 container conversion using FFmpeg.wasm, running entirely in your browser.

## Features

- ⚡ **Lightning fast conversion** - Stream copying without re-encoding
- ✨ **Client-side conversion** - No server required, everything runs in your browser
- 🎯 **Drag & drop interface** - Easy file upload with visual feedback
- 📊 **Real-time progress** - Live conversion progress tracking
- 💾 **Direct download** - Download converted files instantly
- 📱 **Responsive design** - Works on desktop and mobile devices
- 🔒 **Privacy-first** - Files never leave your device

## How It Works

This app performs **container conversion** rather than video re-encoding. It simply changes the container format from MKV to MP4 while keeping the original video and audio streams intact. This makes the conversion:

- **Much faster** (seconds instead of minutes)
- **Lossless** (no quality degradation)
- **Efficient** (minimal CPU usage)

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **FFmpeg.wasm** for video conversion
- **React Dropzone** for file upload
- **Lucide React** for modern icons

## Getting Started

### Prerequisites

- Node.js 16 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

## Usage

1. **Upload a file**: Drag and drop an MKV file onto the upload area or click to browse
2. **Wait for conversion**: The app will automatically start converting your file
3. **Download result**: Once complete, click the download button to save your MP4 file

## Supported Formats

- **Input**: MKV files with H.264/H.265 video and AAC/MP3 audio
- **Output**: MP4 files (original video/audio streams preserved)

> **Note**: This tool performs container conversion only. If your MKV file contains codecs not compatible with MP4 (like VP9 or FLAC), you may need a different conversion approach.

## Browser Compatibility

This application requires a modern browser with support for:
- WebAssembly
- SharedArrayBuffer
- File API

Supported browsers:
- Chrome 68+
- Firefox 79+
- Safari 15.2+
- Edge 79+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── App.tsx              # Main application component
├── VideoConverter.tsx   # Video conversion component
├── VideoConverter.css   # Styles for the converter
├── App.css             # Global styles
└── main.tsx            # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for client-side video processing
- [React Dropzone](https://react-dropzone.js.org/) for file upload functionality
- [Lucide](https://lucide.dev/) for beautiful icons
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
