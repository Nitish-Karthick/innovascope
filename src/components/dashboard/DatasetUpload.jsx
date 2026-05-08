import { fetchWithAuth } from '../../utils/api';
import React, { useState } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle } from 'lucide-react';

const DatasetUpload = ({ onBack, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [datasetInfo, setDatasetInfo] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
            setDatasetInfo(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetchWithAuth('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && !data.error) {
                setStatus('success');
                setMessage(data.message || 'File uploaded successfully!');
                setDatasetInfo({
                    filename: data.filename,
                    rows: data.rows,
                    columns: data.columns
                });
                // Navigate back to dashboard and refresh charts after a short delay
                setTimeout(() => {
                    if (onUploadSuccess) onUploadSuccess();
                }, 1800);
            } else {
                setStatus('error');
                if (data.detail === "MISSING_API_KEY") {
                    window.dispatchEvent(new CustomEvent('api-key-error', { detail: "MISSING API KEY: Please configure your Groq API Key in Settings." }));
                } else if (data.detail && data.detail.startsWith("GROQ_API_ERROR")) {
                    window.dispatchEvent(new CustomEvent('api-key-error', { detail: `API Error: ${data.detail.replace('GROQ_API_ERROR:', '')}. Please check your API key.` }));
                } else {
                    setMessage(data.error || data.detail || 'Upload failed.');
                }
            }
        } catch (error) {
            console.error('Upload Error:', error);
            setStatus('error');
            setMessage('Network error or server is unavailable.');
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto mt-8">
            <div className="mb-4">
                <h1 className="text-3xl font-black text-white font-display mb-2">Dataset Upload</h1>
                <p className="text-text-secondary">Upload a new CSV or JSON dataset to re-train models and update the dashboard insights.</p>
            </div>

            <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center border border-dashed border-border-dark hover:border-primary/50 transition-colors">
                <UploadCloud className="size-16 text-primary/60 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Drag & Drop or Select File</h3>
                <p className="text-sm text-text-secondary mb-4 text-center max-w-md">
                    Supported formats: <strong className="text-white">.csv</strong>, .json.
                </p>
                <div className="text-xs text-text-secondary bg-surface-highlight/50 rounded-lg px-4 py-3 mb-6 text-left w-full max-w-md border border-border-dark">
                    <p className="font-semibold text-white mb-1">Expected CSV columns:</p>
                    <code className="text-accent-cyan">technology, category, sentiment_score, investment_velocity</code>
                    <p className="mt-1 text-text-secondary/70">Try uploading <span className="text-white">sample_tech_dataset.csv</span> to see a live update.</p>
                </div>

                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-surface-highlight hover:bg-surface-highlight/80 text-white px-6 py-2.5 rounded-lg border border-border-dark transition-colors font-medium mb-4"
                >
                    Browse Files
                </label>

                {file && (
                    <div className="flex items-center gap-3 bg-background-dark px-4 py-3 rounded-lg border border-border-dark min-w-[300px]">
                        <FileType className="size-5 text-accent-cyan" />
                        <span className="text-sm text-white truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-text-secondary ml-auto">
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-2">
                <button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading'}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {status === 'uploading' ? 'Processing...' : 'Upload Dataset'}
                </button>
            </div>

            {status === 'success' && (
                <div className="mt-4 p-4 rounded-xl border border-accent-green/50 bg-accent-green/10 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-accent-green font-bold">
                        <CheckCircle className="size-5" />
                        <span>{message}</span>
                    </div>
                    {datasetInfo && (
                        <div className="text-sm text-text-secondary">
                            <p><strong>File:</strong> {datasetInfo.filename}</p>
                            <p><strong>Rows Processed:</strong> {datasetInfo.rows}</p>
                            <p><strong>Features Detected:</strong> {datasetInfo.columns?.join(', ')}</p>
                        </div>
                    )}
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 p-4 rounded-xl border border-red-500/50 bg-red-500/10 flex items-center gap-2 text-red-400 font-bold">
                    <AlertCircle className="size-5" />
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
};

export default DatasetUpload;
