import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Upload, Download, FileVideo, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import './VideoConverter.css';

interface ConversionProgress {
  phase: 'idle' | 'loading' | 'converting' | 'completed' | 'error';
  message: string;
  progress?: number;
}

const VideoConverter: React.FC = () => {
  const [conversionState, setConversionState] = useState<ConversionProgress>({
    phase: 'idle',
    message: 'Ready for fast MKV to MP4 container conversion'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const initializeFFmpeg = async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) {
      return ffmpegRef.current;
    }

    const ffmpeg = new FFmpeg();
    
    setConversionState({
      phase: 'loading',
      message: 'Loading FFmpeg...'
    });

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress }) => {
      setConversionState(prev => ({
        ...prev,
        phase: 'converting',
        message: `Converting container... ${Math.round(progress * 100)}%`,
        progress: progress * 100
      }));
    });

    try {
      await ffmpeg.load();
      ffmpegRef.current = ffmpeg;
      return ffmpeg;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to initialize video converter');
    }
  };

  const convertVideo = useCallback(async (file: File): Promise<void> => {
    try {
      const ffmpeg = await initializeFFmpeg();
      
      setConversionState({
        phase: 'converting',
        message: 'Converting container format (no re-encoding)...',
        progress: 0
      });

      // Write input file
      await ffmpeg.writeFile('input.mkv', await fetchFile(file));

      // Convert MKV to MP4 (stream copy - no re-encoding)
      await ffmpeg.exec([
        '-i', 'input.mkv',
        '-c', 'copy',
        '-movflags', '+faststart',
        'output.mp4'
      ]);

      // Read output file
      const outputData = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });
      const outputUrl = URL.createObjectURL(outputBlob);

      setConvertedVideoUrl(outputUrl);
      setConversionState({
        phase: 'completed',
        message: 'Video converted successfully!',
        progress: 100
      });

      // Clean up
      await ffmpeg.deleteFile('input.mkv');
      await ffmpeg.deleteFile('output.mp4');

    } catch (error) {
      console.error('Conversion failed:', error);
      setConversionState({
        phase: 'error',
        message: 'Conversion failed. Please try again with a different file.'
      });
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setConvertedVideoUrl(null);
      await convertVideo(file);
    }
  }, [convertVideo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mkv']
    },
    multiple: false,
    disabled: conversionState.phase === 'loading' || conversionState.phase === 'converting'
  });

  const downloadVideo = () => {
    if (convertedVideoUrl && uploadedFile) {
      const link = document.createElement('a');
      link.href = convertedVideoUrl;
      link.download = uploadedFile.name.replace(/\.mkv$/i, '.mp4');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetConverter = () => {
    setUploadedFile(null);
    setConvertedVideoUrl(null);
    setConversionState({
      phase: 'idle',
      message: 'Ready for fast MKV to MP4 container conversion'
    });
    if (convertedVideoUrl) {
      URL.revokeObjectURL(convertedVideoUrl);
    }
  };

  const getStatusIcon = () => {
    switch (conversionState.phase) {
      case 'loading':
      case 'converting':
        return <Loader2 className="status-icon spinning" />;
      case 'completed':
        return <CheckCircle className="status-icon success" />;
      case 'error':
        return <AlertCircle className="status-icon error" />;
      default:
        return <FileVideo className="status-icon" />;
    }
  };

  return (
    <div className="video-converter">
      <div className="converter-header">
        <h1>MKV to MP4 Converter</h1>
        <p>Fast container conversion - no re-encoding required</p>
      </div>

      <div className="converter-main">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${
              conversionState.phase === 'loading' || conversionState.phase === 'converting' ? 'disabled' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="upload-icon" />
            <h3>Drop your MKV file here</h3>
            <p>or click to browse files</p>
            <small>Only .mkv files are supported</small>
          </div>
        ) : (
          <div className="file-info">
            <div className="file-details">
              <FileVideo className="file-icon" />
              <div>
                <h3>{uploadedFile.name}</h3>
                <p>{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={resetConverter} className="reset-button">
              Upload New File
            </button>
          </div>
        )}

        <div className="status-section">
          <div className="status-indicator">
            {getStatusIcon()}
            <span className="status-message">{conversionState.message}</span>
          </div>

          {conversionState.progress !== undefined && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${conversionState.progress}%` }}
              />
            </div>
          )}
        </div>

        {conversionState.phase === 'completed' && convertedVideoUrl && (
          <div className="download-section">
            <button onClick={downloadVideo} className="download-button">
              <Download className="download-icon" />
              Download MP4
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConverter;
