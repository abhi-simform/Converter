/// <reference types="vite/client" />

declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(): Promise<void>;
    writeFile(name: string, data: Uint8Array): Promise<void>;
    readFile(name: string): Promise<Uint8Array>;
    exec(args: string[]): Promise<void>;
    deleteFile(name: string): Promise<void>;
    on(event: 'log' | 'progress', callback: (data: any) => void): void;
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: File | string): Promise<Uint8Array>;
}
