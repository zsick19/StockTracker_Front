import React, { useState, useCallback } from 'react';
import { useUploadStockDataCsvMutation } from '../../../../../../../../features/Utility/UtilityApiSlice';

export const StockCsvUpload = () =>
{
    const [activeFile, setActiveFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ state: 'IDLE', message: '' });

    const handleDragOver = useCallback((e) =>
    {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() =>
    {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) =>
    {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0)
        {
            // Confirm the asset is genuinely a .csv text file before loading
            if (files[0].name.endsWith('.csv'))
            {
                setActiveFile(files[0]);
                setUploadStatus({ state: 'FILE_LOADED', message: `Target Loaded: ${files[0].name}` });
            } else
            {
                setUploadStatus({ state: 'ERROR', message: 'Rejected: File type must be valid CSV.' });
            }
        }
    }, []);

    const handleFileSelect = (e) =>
    {
        const files = e.target.files;
        if (files && files.length > 0)
        {
            setActiveFile(files[0]);
            setUploadStatus({ state: 'FILE_LOADED', message: `Target Loaded: ${files[0].name}` });
        }
    };


    const [uploadStockDataCsv] = useUploadStockDataCsvMutation()
    async function attemptExecuteUploadPipeline()
    {
        if (!activeFile) return;

        setUploadStatus({ state: 'PROCESSING', message: 'Streaming records and parsing headers...' });

        // Package the file binary inside a native multipart form container
        const formPayload = new FormData();
        formPayload.append('csvFile', activeFile);




        try
        {
            const response = await uploadStockDataCsv({ formData: formPayload }).unwrap()

            setUploadStatus({
                state: 'SUCCESS',
                message: `🎯 Success! Processed and aligned ${response.recordsProcessed} stocks in your database.`
            });
            setActiveFile(null);

        } catch (error)
        {
            console.error(error);
            setUploadStatus({ state: 'ERROR', message: `Pipeline Error: ${error.message}` });
        }
    };

    return (
        <div className="csv-uploader-wrapper" style={{ padding: '20px', maxWidth: '500px', fontFamily: 'monospace' }}>
            <div className="dropzone-area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    height: '180px',
                    border: isDragging ? '2px dashed #00FFFF' : '2px dashed #333',
                    background: isDragging ? 'rgba(0, 255, 255, 0.02)' : '#111',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}>
                <input type="file" id="filePicker" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} />
                <label htmlFor="filePicker" style={{ cursor: 'pointer', textAlign: 'center', color: '#888' }}>
                    <span style={{ color: '#00FFFF', fontWeight: 'bold', fontSize: '15px' }}>⚡ DRAG DAILY CSV HERE</span>
                    <br /><span style={{ fontSize: '11px' }}>or click to browse local files</span>
                </label>
            </div>

            {uploadStatus.message && (
                <div className="status-readout" style={{
                    marginTop: '15px',
                    fontSize: '12px',
                    color: uploadStatus.state === 'ERROR' ? '#FF0055' : (uploadStatus.state === 'SUCCESS' ? '#00FFCC' : '#fff'),
                    background: '#1a1a1a',
                    padding: '10px',
                    borderRadius: '4px'
                }}>
                    {uploadStatus.message}
                </div>
            )}

            {activeFile && uploadStatus.state !== 'PROCESSING' && (
                <button onClick={attemptExecuteUploadPipeline}
                    style={{
                        marginTop: '15px',
                        width: '100%',
                        padding: '10px',
                        background: '#00FFFF',
                        color: '#000',
                        border: 'none',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    SYNC DATA TO MONGODB
                </button>
            )}
        </div>
    );
};
