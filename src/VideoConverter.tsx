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

interface FileConversion {
  file: File;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

interface OutputFormat {
  label: string;
  value: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

const OUTPUT_FORMATS: OutputFormat[] = [
  { 
    label: 'MP4', 
    value: 'mp4', 
    description: 'Most compatible format for web and devices',
    icon: '🎬',
    recommended: true
  },
  { 
    label: 'WebM', 
    value: 'webm', 
    description: 'Optimized for web streaming',
    icon: '🌐'
  },
  { 
    label: 'MKV', 
    value: 'mkv', 
    description: 'High quality container with subtitle support',
    icon: '📽️'
  },
  { 
    label: 'MOV', 
    value: 'mov', 
    description: 'Apple QuickTime format',
    icon: '🍎'
  },
  { 
    label: 'AVI', 
    value: 'avi', 
    description: 'Classic Windows video format',
    icon: '🖥️'
  },
  { 
    label: 'M4V', 
    value: 'm4v', 
    description: 'iTunes compatible format',
    icon: '🎵'
  },
  { 
    label: 'FLV', 
    value: 'flv', 
    description: 'Flash video format',
    icon: '⚡'
  },
  { 
    label: 'GIF', 
    value: 'gif', 
    description: 'Animated image format',
    icon: '🎞️'
  },
];

const VideoConverter: React.FC = () => {
  const [conversionState, setConversionState] = useState<ConversionProgress>({
    phase: 'idle',
    message: 'Ready for fast video conversion'
  });
  const [uploadedFiles, setUploadedFiles] = useState<FileConversion[]>([]);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
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
        message: `Converting... ${Math.round(progress * 100)}%`,
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

  const convertVideo = useCallback(async (fileConversion: FileConversion): Promise<void> => {
    try {
      const ffmpeg = await initializeFFmpeg();
      
      // Update file status to converting
      setUploadedFiles(prev => 
        prev.map(fc => 
          fc.file === fileConversion.file 
            ? { ...fc, status: 'converting', progress: 0 }
            : fc
        )
      );

      setConversionState({
        phase: 'converting',
        message: `Converting ${fileConversion.file.name} to .${outputFormat}...`,
        progress: 0
      });

      // Write input file
      const inputName = `input_${Date.now()}.${fileConversion.file.name.split('.').pop()}`;
      await ffmpeg.writeFile(inputName, await fetchFile(fileConversion.file));

      // Convert to selected format
      const outputName = `output_${Date.now()}.${outputFormat}`;
      const args = [
        '-i', inputName,
        '-c', outputFormat === 'gif' ? 'gif' : 'copy',
        '-movflags', '+faststart',
        outputName
      ];

      if (outputFormat === 'gif') {
        args.splice(3, 2); // Remove '-c', 'copy' for GIF
      }

      await ffmpeg.exec(args);

      // Read output file
      const outputData = await ffmpeg.readFile(outputName);
      const mimeType = outputFormat === 'gif' ? 'image/gif' : `video/${outputFormat}`;
      const outputBlob = new Blob([outputData], { type: mimeType });
      const outputUrl = URL.createObjectURL(outputBlob);

      // Update file status to completed
      setUploadedFiles(prev => 
        prev.map(fc => 
          fc.file === fileConversion.file 
            ? { ...fc, status: 'completed', progress: 100, downloadUrl: outputUrl }
            : fc
        )
      );

      // Clean up
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      // Check if all files are completed
      const allCompleted = uploadedFiles.every(fc => 
        fc.file === fileConversion.file || fc.status === 'completed' || fc.status === 'error'
      );
      
      if (allCompleted) {
        setConversionState({
          phase: 'completed',
          message: 'All conversions completed!',
          progress: 100
        });
      }

    } catch (error) {
      console.error('Conversion failed:', error);
      setUploadedFiles(prev => 
        prev.map(fc => 
          fc.file === fileConversion.file 
            ? { ...fc, status: 'error', error: 'Conversion failed' }
            : fc
        )
      );
    }
  }, [outputFormat, uploadedFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Limit to 5 files maximum
    const currentCount = uploadedFiles.length;
    const availableSlots = 5 - currentCount;
    const filesToProcess = acceptedFiles.slice(0, availableSlots);
    
    const newFiles: FileConversion[] = filesToProcess.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Convert files one by one
    for (const fileConversion of newFiles) {
      await convertVideo(fileConversion);
    }
  }, [convertVideo, uploadedFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mkv', '.avi', '.mov', '.mp4', '.webm', '.flv', '.m4v']
    },
    multiple: true,
    maxFiles: 5,
    disabled: conversionState.phase === 'loading' || conversionState.phase === 'converting'
  });

  const downloadVideo = (fileConversion: FileConversion) => {
    if (fileConversion.downloadUrl) {
      const ext = outputFormat;
      const link = document.createElement('a');
      link.href = fileConversion.downloadUrl;
      link.download = fileConversion.file.name.replace(/\.[^.]+$/, `.${ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetConverter = () => {
    // Revoke all download URLs
    uploadedFiles.forEach(fc => {
      if (fc.downloadUrl) {
        URL.revokeObjectURL(fc.downloadUrl);
      }
    });
    
    setUploadedFiles([]);
    setConversionState({
      phase: 'idle',
      message: 'Ready for fast video conversion'
    });
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
        <h1>Video Converter</h1>
        <p>Fast container conversion - supports multiple formats</p>
      </div>

      <div className="converter-main">
        <div className="format-selection">
          <label className="format-selection-label">Choose output format:</label>
          <div className="format-grid">
            {OUTPUT_FORMATS.map(fmt => (
              <label key={fmt.value} className={`format-option ${outputFormat === fmt.value ? 'selected' : ''} ${fmt.recommended ? 'recommended' : ''}`}>
                <input
                  type="radio"
                  name="output-format"
                  value={fmt.value}
                  checked={outputFormat === fmt.value}
                  onChange={e => setOutputFormat(e.target.value)}
                  className="format-input"
                  disabled={conversionState.phase === 'loading' || conversionState.phase === 'converting'}
                />
                <div className="format-icon">{fmt.icon}</div>
                <div className="format-info">
                  <h4 className="format-name">{fmt.label}</h4>
                  <p className="format-description">{fmt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {uploadedFiles.length === 0 ? (
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''} ${
              conversionState.phase === 'loading' || conversionState.phase === 'converting' ? 'disabled' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="upload-icon" />
            <h3>Drop your video files here</h3>
            <p>or click to browse files</p>
            <small>Up to 5 files supported (.mkv, .avi, .mov, .mp4, .webm, .flv, .m4v)</small>
          </div>
        ) : (
          <div className="files-list">
            {uploadedFiles.map((fileConversion, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <div className="file-details">
                    <FileVideo className="file-icon" />
                    <div>
                      <h3>{fileConversion.file.name}</h3>
                      <p>{(fileConversion.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="file-status">
                    {fileConversion.status === 'pending' && <span>Pending</span>}
                    {fileConversion.status === 'converting' && (
                      <div className="converting-status">
                        <Loader2 className="status-icon spinning" />
                        <span>Converting...</span>
                      </div>
                    )}
                    {fileConversion.status === 'completed' && (
                      <div className="completed-status">
                        <CheckCircle className="status-icon success" />
                        <button 
                          onClick={() => downloadVideo(fileConversion)} 
                          className="download-button-small"
                        >
                          <Download className="download-icon" />
                          Download
                        </button>
                      </div>
                    )}
                    {fileConversion.status === 'error' && (
                      <div className="error-status">
                        <AlertCircle className="status-icon error" />
                        <span>Error</span>
                      </div>
                    )}
                  </div>
                </div>
                {fileConversion.status === 'converting' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${fileConversion.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {uploadedFiles.length < 5 && (
              <div
                {...getRootProps()}
                className={`dropzone-small ${isDragActive ? 'active' : ''}`}
                style={{ marginTop: '1rem' }}
              >
                <input {...getInputProps()} />
                <Upload className="upload-icon-small" />
                <span>Add more files (max 5)</span>
              </div>
            )}
            
            <button onClick={resetConverter} className="reset-button" style={{ marginTop: '1rem' }}>
              Clear All Files
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
      </div>
    </div>
  );
};

export default VideoConverter;
