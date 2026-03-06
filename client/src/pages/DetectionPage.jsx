import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

function DetectionPage({ token }) {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scanPhase, setScanPhase] = useState('');

    const onDrop = useCallback((acceptedFiles) => {
        const f = acceptedFiles[0];
        if (f) {
            setFile(f);
            if (f.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(f));
            } else {
                setPreview('video');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'video/mp4': ['.mp4'],
        },
        maxFiles: 1,
        maxSize: 100 * 1024 * 1024,
    });

    const handleDetect = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setScanPhase('Uploading file...');

        try {
            // Upload
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                onUploadProgress: (e) => {
                    const pct = Math.round((e.loaded * 100) / e.total);
                    setProgress(Math.min(pct, 40));
                },
            });

            const scanId = uploadRes.data.scan.id;
            setUploading(false);
            setDetecting(true);
            setProgress(45);
            setScanPhase('Initializing neural network...');

            // Simulate scan phases
            await wait(800);
            setProgress(55);
            setScanPhase('Analyzing frequency domain...');
            await wait(700);
            setProgress(65);
            setScanPhase('Detecting noise patterns...');
            await wait(600);
            setProgress(75);
            setScanPhase('Scanning facial artifacts...');
            await wait(800);
            setProgress(85);
            setScanPhase('Computing confidence scores...');

            // Detect
            const detectRes = await axios.post('/api/detect', { scanId });
            setProgress(100);
            setScanPhase('Analysis complete');
            await wait(500);

            // Navigate to results
            navigate('/result', {
                state: {
                    result: detectRes.data,
                    fileName: file.name,
                    fileType: file.type.startsWith('image') ? 'image' : 'video',
                    preview: file.type.startsWith('image') ? preview : null,
                },
            });
        } catch (err) {
            console.error('Detection error:', err);
            setScanPhase('Error occurred. Please try again.');
            setUploading(false);
            setDetecting(false);
            setProgress(0);
        }
    };

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const removeFile = () => {
        setFile(null);
        setPreview(null);
        setProgress(0);
        setScanPhase('');
    };

    const isProcessing = uploading || detecting;

    return (
        <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
                        Media Detection
                    </h1>
                    <p className="text-text-secondary">
                        Upload an image or video to analyze for deepfake artifacts
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Upload Zone */}
                    {!file && !isProcessing && (
                        <div
                            {...getRootProps()}
                            className={`ui-upload-zone ${isDragActive ? 'active' : ''}`}
                        >
                            <input {...getInputProps()} />
                            <svg
                                className="ui-upload-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <p className="ui-upload-text">
                                {isDragActive
                                    ? 'Drop your file here'
                                    : 'Drag and drop a file here, or click to browse'}
                            </p>
                            <p className="ui-upload-hint">
                                Supported: JPG, PNG, MP4 (max 100MB)
                            </p>
                        </div>
                    )}

                    {/* File Preview */}
                    {file && !isProcessing && (
                        <div className="ui-card">
                            <div className="flex items-start gap-4">
                                {/* Thumbnail */}
                                <div
                                    className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0"
                                    style={{ background: 'rgba(18, 18, 26, 0.8)' }}
                                >
                                    {preview && preview !== 'video' ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                                            <svg
                                                width="40"
                                                height="40"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            >
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-text-primary truncate">
                                        {file.name}
                                    </h3>
                                    <p className="text-sm text-text-muted mt-1">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB --{' '}
                                        {file.type.startsWith('image') ? 'Image' : 'Video'}
                                    </p>
                                    <div className="flex gap-3 mt-4">
                                        <button className="ui-btn" onClick={handleDetect}>
                                            <span>Analyze Media</span>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="ui-btn"
                                            onClick={removeFile}
                                            style={{ background: 'transparent' }}
                                        >
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Processing State */}
                    <AnimatePresence>
                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="ui-card"
                            >
                                <div className="flex flex-col items-center py-8">
                                    {/* Scanner container */}
                                    <div className="relative mb-8">
                                        {preview && preview !== 'video' ? (
                                            <div className="relative w-48 h-48 rounded-xl overflow-hidden">
                                                <img
                                                    src={preview}
                                                    alt="Scanning"
                                                    className="w-full h-full object-cover"
                                                    style={{ filter: 'brightness(0.7)' }}
                                                />
                                                <div className="scan-overlay">
                                                    <div className="scan-line" />
                                                    <div className="scan-corner scan-corner-tl" />
                                                    <div className="scan-corner scan-corner-tr" />
                                                    <div className="scan-corner scan-corner-bl" />
                                                    <div className="scan-corner scan-corner-br" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="ui-loader ui-loader-lg">
                                                <div className="ui-loader-ring" />
                                                <div className="ui-loader-ring" />
                                                <div className="ui-loader-ring" />
                                                <div className="ui-loader-dot" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Phase text */}
                                    <p className="text-sm text-neon-purple font-mono mb-4 tracking-wide">
                                        {scanPhase}
                                    </p>

                                    {/* Progress bar */}
                                    <div className="w-full max-w-sm">
                                        <div className="ui-progress ui-progress-lg">
                                            <div
                                                className="ui-progress-bar"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-text-muted text-center mt-2 font-mono">
                                            {progress}%
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

export default DetectionPage;
