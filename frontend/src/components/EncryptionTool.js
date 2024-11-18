import React, { useState } from 'react';
import axios from 'axios';
import './EncryptionTool.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock, faSync, faFileUpload, faKey } from '@fortawesome/free-solid-svg-icons';

const EncryptionTool = ({ isAuthenticated, setEncryptionKey }) => {
    const [file, setFile] = useState(null);
    const [key, setKey] = useState('');
    const [mode, setMode] = useState('encrypt');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleModeChange = (e) => {
        setMode(e.target.value);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file to proceed.');
            return;
        }
    
        if (mode === 'decrypt' && !file.name.endsWith('.enc')) {
            setMessage('Error: Please select a file with a .enc extension for decryption.');
            return;
        }
    
        if (mode === 'decrypt' && key.length === 0) {
            setMessage('Please provide a decryption key.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        if (mode === 'decrypt') formData.append('key', key);
    
        setLoading(true);
        setUploadProgress(0);
        setDownloadProgress(0);
        setShowModal(true);
    
        try {
            const endpoint = mode === 'encrypt' ? '/api/encrypt/' : '/api/decrypt/';
            
            // Use the new backend URL
            const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
                responseType: mode === 'decrypt' ? 'blob' : 'json',
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setDownloadProgress(percentCompleted);
                },
            });
    
            if (mode === 'encrypt') {
                const { encryption_key, file_name, file } = response.data;
                setEncryptionKey(encryption_key);
    
                const blob = new Blob([Uint8Array.from(atob(file), (c) => c.charCodeAt(0))]);
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', file_name);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else if (mode === 'decrypt') {
                const contentDisposition = response.headers['content-disposition'];
                let original_filename = file.name.replace('.enc', '');
                if (contentDisposition) {
                    const matches = contentDisposition.match(/filename="?([^";]+)"?/);
                    if (matches && matches[1]) original_filename = matches[1];
                }
    
                const blob = response.data;
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', original_filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
    
            setMessage('File processed successfully.');
        } catch (error) {
            console.error('Error processing the file', error.response?.data || error);
            setMessage(error.response?.data?.error || 'There was an error processing your request.');
        } finally {
            setLoading(false);
            setShowModal(false);
        }
    };
    

    const handleRefresh = () => window.location.reload();

    return (
        <div className="encryption-tool">
            <h1>Data Encryption & Decryption Tool</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    <FontAwesomeIcon icon={faFileUpload} /> Select File:
                    <input type="file" onChange={handleFileChange} />
                </label>
                <label>
                    <FontAwesomeIcon icon={faLock} /> Operation:
                    <select value={mode} onChange={handleModeChange}>
                        <option value="encrypt">Encrypt</option>
                        <option value="decrypt">Decrypt</option>
                    </select>
                </label>
                
                {mode === 'decrypt' && (
                    <label>
                        <FontAwesomeIcon icon={faKey} /> Decryption Key:
                        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter the decryption key" />
                    </label>
                )}
                
                {isAuthenticated ? (
                    <div className="button-group">
                        <button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faLock} spin /> Processing...
                                </>
                            ) : mode === 'encrypt' ? (
                                <>
                                    <FontAwesomeIcon icon={faLock} /> Encrypt File
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faUnlock} /> Decrypt File
                                </>
                            )}
                        </button>
                        <button type="button" onClick={handleRefresh} className="refresh-button">
                            <FontAwesomeIcon icon={faSync} /> Refresh
                        </button>
                    </div>
                ) : (
                    <p>You must log in to use the tool.</p>
                )}
                
                {message && <p className="error-message">{message}</p>}

                {loading && (
                    <>
                        <div className="progress-bar">
                            <label>Upload Progress:</label>
                            <progress value={uploadProgress} max="100">{uploadProgress}%</progress>
                        </div>
                        <div className="progress-bar">
                            <label>Download Progress:</label>
                            <progress value={downloadProgress} max="100">{downloadProgress}%</progress>
                        </div>
                    </>
                )}
            </form>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Processing your file...</h2>
                        <p>Please wait. This may take a few moments.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EncryptionTool;
