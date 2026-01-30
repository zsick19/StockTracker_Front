import React from 'react'

function FlashAlert({ flashAlert, setFlashAlert })
{
    return (
        <div>FlashAlert

            <button onClick={() => setFlashAlert([])}>Clear Flash</button>
        </div>
    )
}

export default FlashAlert