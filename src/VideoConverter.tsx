import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Upload, Download, FileVideo, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
        return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileVideo className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Video Converter
        </h1>
        <p className="text-lg text-gray-600">Fast container conversion - supports multiple formats</p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-800 mb-4">Choose output format:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {OUTPUT_FORMATS.map(fmt => (
              <label
                key={fmt.value}
                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all bg-white shadow-sm hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md hover:-translate-y-0.5 ${
                  outputFormat === fmt.value 
                    ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' 
                    : 'border-gray-200'
                } ${
                  fmt.recommended 
                    ? 'after:content-["Recommended"] after:absolute after:-top-2 after:right-2 after:bg-gradient-to-r after:from-indigo-400 after:to-purple-500 after:text-white after:text-xs after:font-bold after:px-2 after:py-0.5 after:rounded after:uppercase after:tracking-wider' 
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="output-format"
                  value={fmt.value}
                  checked={outputFormat === fmt.value}
                  onChange={e => setOutputFormat(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                  disabled={conversionState.phase === 'loading' || conversionState.phase === 'converting'}
                />
                <span className="text-2xl mr-4 select-none">{fmt.icon}</span>
                <div className="flex-1">
                  <span className="block text-base font-semibold text-gray-900 mb-1">{fmt.label}</span>
                  <span className="block text-xs text-gray-500 leading-tight">{fmt.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {uploadedFiles.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md ${
              isDragActive ? 'border-indigo-400 bg-indigo-100 scale-105' : 'border-gray-300'
            } ${
              conversionState.phase === 'loading' || conversionState.phase === 'converting' 
                ? 'opacity-60 cursor-not-allowed pointer-events-none' 
                : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-indigo-400 mb-4 mx-auto" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Drop your video files here</h3>
            <p className="text-base text-gray-500 mb-2">or click to browse files</p>
            <small className="text-sm text-gray-400">Up to 5 files supported (.mkv, .avi, .mov, .mp4, .webm, .flv, .m4v)</small>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {uploadedFiles.map((fileConversion, index) => (
              <div key={index} className="bg-indigo-50 border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <FileVideo className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 m-0 mb-1">{fileConversion.file.name}</h3>
                      <p className="text-sm text-gray-500 m-0">{(fileConversion.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {fileConversion.status === 'pending' && <span className="text-gray-500">Pending</span>}
                    {fileConversion.status === 'converting' && (
                      <div className="flex items-center gap-2 text-indigo-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Converting...</span>
                      </div>
                    )}
                    {fileConversion.status === 'completed' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <button 
                          onClick={() => downloadVideo(fileConversion)} 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded font-semibold text-sm shadow hover:-translate-y-0.5 hover:shadow-lg transition"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    )}
                    {fileConversion.status === 'error' && (
                      <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                        <span>Error</span>
                      </div>
                    )}
                  </div>
                </div>
                {fileConversion.status === 'converting' && (
                  <div className="w-full h-2 bg-gray-200 rounded mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded transition-all duration-300"
                      style={{ width: `${fileConversion.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {uploadedFiles.length < 5 && (
              <div
                {...getRootProps()}
                className={`border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 flex items-center justify-center gap-2 mt-2 ${
                  isDragActive ? 'border-indigo-400 bg-indigo-100 scale-105' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-5 h-5 text-indigo-400" />
                <span className="text-sm text-gray-500">Add more files (max 5)</span>
              </div>
            )}
            
            <button 
              onClick={resetConverter} 
              className="mt-4 px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-200 transition self-end"
            >
              Clear All Files
            </button>
          </div>
        )}

        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon()}
            <span className="text-base font-medium text-gray-800">{conversionState.message}</span>
          </div>

          {conversionState.progress !== undefined && (
            <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded transition-all duration-300"
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
