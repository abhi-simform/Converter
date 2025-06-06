# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React TypeScript application for fast MKV to MP4 container conversion using FFmpeg.wasm.

## Project Context
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Video Processing**: FFmpeg.wasm for client-side container conversion (stream copying)
- **UI Components**: Modern React components with drag-and-drop file upload
- **Styling**: CSS modules and modern UI patterns

## Code Style Guidelines
- Use TypeScript with strict type checking
- Follow React best practices with functional components and hooks
- Use async/await for FFmpeg operations
- Implement proper error handling for video conversion processes
- Keep components modular and reusable
- Use modern CSS features for styling

## Key Features
- Fast container conversion using `-c copy` (no re-encoding)
- Drag-and-drop MKV file upload
- Real-time conversion progress tracking
- Download converted MP4 files
- Error handling and user feedback
- Responsive design

## Video Conversion Approach
- Uses stream copying (`-c copy`) instead of re-encoding for speed
- Preserves original video and audio quality
- Only changes container format from MKV to MP4
