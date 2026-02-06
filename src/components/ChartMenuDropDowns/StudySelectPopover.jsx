import React, { useState } from 'react'
import './StudySelectPopover.css'


function StudySelectPopover({ handleStudySelectChange, setShowStudiesSelect, subCharts })
{

    const [studyChangeCapture, setStudyChangeCapture] = useState(subCharts)

    function handleStudyChange(e)
    {
        if (e.target.checked) setStudyChangeCapture(prev => [...prev, e.target.id])
        else setStudyChangeCapture(prev => prev.filter((t) => t !== e.target.id))
    }

    return (
        <>
            <div className='studySelectOverlay' onClick={() => setShowStudiesSelect(false)}></div>
            <div className='LSH-StudySelectPopover'>
                <fieldset onChange={(e) => handleStudyChange(e)}>

                    <input type="checkbox" name="rsi" id="rsi" checked={studyChangeCapture.includes('rsi')} />
                    <label htmlFor="rsi">RSI</label>

                    <input type="checkbox" name="MACD" id="MACD" checked={studyChangeCapture.includes('MACD')} />
                    <label htmlFor="MACD">MACD</label>

                    <input type="checkbox" name="study" id="vortex" checked={studyChangeCapture.includes('vortex')} />
                    <label htmlFor="vortex">Vortex</label>

                    <input type="checkbox" name="study" id="stochastic" checked={studyChangeCapture.includes('stochastic')} />
                    <label htmlFor="stochastic">Stochastic</label>

                    <input type="checkbox" name="study" id="volumeProfile" checked={studyChangeCapture.includes('volumeProfile')} />
                    <label htmlFor="volumeProfile">Volume Profile</label>

                </fieldset>
                <button onClick={(e) => { e.stopPropagation(); handleStudySelectChange(studyChangeCapture); setShowStudiesSelect(false) }}>Submit</button>
                <button onClick={(e) => { e.stopPropagation(); setShowStudiesSelect(false) }}>Close</button>
            </div>
        </>
    )
}

export default StudySelectPopover