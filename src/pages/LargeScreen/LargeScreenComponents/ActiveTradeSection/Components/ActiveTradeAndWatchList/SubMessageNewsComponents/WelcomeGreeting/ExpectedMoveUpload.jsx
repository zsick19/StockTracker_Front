import React, { useState } from 'react';
import { useUploadExpectedCoreMovesFromAsherBotMutation, useUploadZoneDocumentMutation } from '../../../../../../../../features/Utility/UtilityApiSlice';

export default function ExpectedMoveUpload({ Time, Process })
{
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    const handleFileChange = (e) =>
    {
        setFile(e.target.files[0]);
    };



    const [uploadExpectedCoreMovesFromAsherBot] = useUploadExpectedCoreMovesFromAsherBotMutation()
    const [uploadZoneDocument] = useUploadZoneDocumentMutation()

    async function attemptExecuteUpload(e)
    {

        e.preventDefault();
        if (!file)
        {
            setStatus('Please select a file first.');
            return;
        }
        try
        {

            const formPayLoad = new FormData();
            let response
            setStatus('Uploading...');
            switch (Process)
            {
                case 'Core Daily EM':
                    formPayLoad.append('expectedMovesCoreFile', file);
                    response = await uploadExpectedCoreMovesFromAsherBot({ formData: formPayLoad }).unwrap()
                    setStatus(`Success! Processed ${response?.count} tickers.`);
                    break;

                case 'Zone Doc':
                    formPayLoad.append('zonePDF', file);
                    response = await uploadZoneDocument({ formData: formPayLoad }).unwrap()
                    setStatus(`Success!`)
                    break;
            }
        } catch (error)
        {
            console.error(error);
            setStatus('Failed to upload file.');
        }
    };

    return (
        <div>
            <p>Upload {Process}</p>
            <form onSubmit={attemptExecuteUpload}>
                <input type="file" accept=".txt" onChange={handleFileChange} />
                <button type="submit" >Upload</button>
            </form>
            {status && <p><strong>Status:</strong> {status}</p>}
        </div>
    );
}
