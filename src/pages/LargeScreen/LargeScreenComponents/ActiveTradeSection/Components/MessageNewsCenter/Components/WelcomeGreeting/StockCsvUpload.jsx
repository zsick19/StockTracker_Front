import React, { useState, useCallback } from 'react';
import { useUploadExpectedCoreMovesFromAsherBotMutation, useUploadStockDataCsvMutation, useUploadZoneDocumentMutation } from '../../../../../../../../features/Utility/UtilityApiSlice';

export const StockCsvUpload = ({ process }) =>
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
            if (files[0].name.endsWith('.csv') || files[0].name.endsWith('.txt') || files[0].name.endsWith('.pdf'))
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
    const [uploadExpectedCoreMovesFromAsherBot] = useUploadExpectedCoreMovesFromAsherBotMutation()
    const [uploadZoneDocument] = useUploadZoneDocumentMutation()

    const [expectedMovesTimePeriod, setExpectedMovesTimePeriod] = useState('DAILY')

    async function attemptExecuteUpload(e)
    {
        e.preventDefault();
        if (!activeFile)
        {
            setUploadStatus({ state: 'ERROR', message: 'File Missing' });
            return;
        }
        try
        {
            let response
            setUploadStatus({ state: 'PROCESSING', message: 'Streaming records...' });

            const formPayLoad = new FormData();
            switch (process)
            {
                case 'DAILY CSV':
                    formPayLoad.append('csvFile', activeFile);
                    response = await uploadStockDataCsv({ formData: formPayLoad }).unwrap()
                    setUploadStatus({ state: 'SUCCESS', message: `Success! Processed ${response.recordsProcessed} stocks.` });
                    break;
                case 'ASHER EM':
                    formPayLoad.append('expectedMovesCoreFile', activeFile);
                    response = await uploadExpectedCoreMovesFromAsherBot({ formData: formPayLoad, emSource: 'asher', timePeriod: expectedMovesTimePeriod }).unwrap()
                    setUploadStatus({ state: 'SUCCESS', message: `Success! Processed ${response.recordsProcessed} stocks.` });
                    break;
                case 'DAILY EM':
                    formPayLoad.append('expectedMovesCoreFile', activeFile);
                    response = await uploadExpectedCoreMovesFromAsherBot({ formData: formPayLoad, emSource: 'optionsChain', timePeriod: expectedMovesTimePeriod }).unwrap()
                    setUploadStatus({ state: 'SUCCESS', message: `Success! Processed ${response.recordsProcessed} stocks.` });
                    break;
                case 'ZONE DOC':
                    formPayLoad.append('zonePDF', activeFile);
                    response = await uploadZoneDocument({ formData: formPayLoad }).unwrap()
                    setUploadStatus({ state: 'SUCCESS', message: `Success! Processed ${response.recordsProcessed} stocks.` });
                    break;
            }

            setActiveFile(null);
            setTimeout(() => { setUploadStatus({ state: 'IDLE', message: '' }) }, [5000])

        } catch (error)
        {
            console.error(error);
            setUploadStatus({ state: 'ERROR', message: `Pipeline Error: ${error.message}` });
        }
    };


    return (
        <div className="csv-uploader-wrapper" style={{ display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>


            <div className="dropzone-area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: isDragging ? '2px dashed #00FFFF' : '2px dashed #333',
                    background: isDragging ? 'rgba(0, 255, 255, 0.02)' : '#111',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '200px', height: '100px',
                    transition: 'all 0.2s ease'
                }}>
                <input type="file" id="filePicker" accept=".csv" onClick={(e) => e.preventDefault()} onChange={handleFileSelect} style={{ display: 'none' }} />
                <label htmlFor="filePicker" style={{ cursor: 'pointer', textAlign: 'center', color: '#888', width: '100%' }}>
                    <span style={{
                        color: `${process === 'DAILY CSV' ? '#00FFFF' :
                            process === 'ASHER EM' ? "purple" :
                                process === 'DAILY EM' ? 'gold' :
                                    "#00ff55"}`, fontWeight: 'bold', fontSize: '15px'
                    }}>DRAG {process} HERE</span>
                </label>
            </div >


            {uploadStatus.message ? (
                <div className="status-readout" style={{
                    marginTop: '0.5rem', fontSize: '12px',
                    color: uploadStatus.state === 'ERROR' ? '#FF0055' : (uploadStatus.state === 'SUCCESS' ? '#00FFCC' : '#fff'),
                    background: '#1a1a1a',
                    padding: '5px', borderRadius: '4px'
                }}>
                    {uploadStatus.message}
                </div>
            ) :
                (process === 'ASHER EM' || process === 'DAILY EM') ?
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }} >
                        <button style={{ backgroundColor: `${expectedMovesTimePeriod === 'DAILY' ? 'blue' : ''}` }} onClick={() => setExpectedMovesTimePeriod('DAILY')}>D</button>
                        <button style={{ backgroundColor: `${expectedMovesTimePeriod === 'WEEKLY' ? 'blue' : ''}` }} onClick={() => setExpectedMovesTimePeriod('WEEKLY')}>W</button>
                        <button style={{ backgroundColor: `${expectedMovesTimePeriod === 'MONTHLY' ? 'blue' : ''}` }} onClick={() => setExpectedMovesTimePeriod('MONTHLY')}>M</button>
                        <button style={{ backgroundColor: `${expectedMovesTimePeriod === 'QUARTERLY' ? 'blue' : ''}` }} onClick={() => setExpectedMovesTimePeriod('QUARTERLY')}>Q</button>
                        <button style={{ backgroundColor: `${expectedMovesTimePeriod === 'YEARLY' ? 'blue' : ''}` }} onClick={() => setExpectedMovesTimePeriod('YEARLY')}>Y</button>
                    </div> : ""}

            {activeFile && uploadStatus.state !== 'PROCESSING' && (
                <button onClick={attemptExecuteUpload}
                    style={{
                        marginTop: '1rem', width: '100%',

                        background: '#00FFFF',
                        color: '#000',
                        border: 'none',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                    SYNC DATA TO MONGODB
                </button>
            )
            }
        </div >
    );
};
