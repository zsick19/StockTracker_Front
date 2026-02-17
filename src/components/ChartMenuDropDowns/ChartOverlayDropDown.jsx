import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import './ChartOverlayDropDown.css'
import { setGraphEMAControl, setGraphVolumeControl, setGraphVolumeProfileControl, setGraphVWAPControl } from '../../features/Charting/GraphStudiesVisualElement'

function ChartOverlayDropDown({ uuid, setShowChartStudyOverlaySelect })
{
    const dispatch = useDispatch()

    return (

        <>
            <div className='DateFocusDropDownUnderlay' onClick={() => setShowChartStudyOverlaySelect(false)}></div>
            <div className='ChartOverlayDropDown'>

                <button onClick={(e) => { e.stopPropagation(); dispatch(setGraphEMAControl({ uuid })) }}>EMA</button>
                <button onClick={(e) => { e.stopPropagation(); dispatch(setGraphVWAPControl({ uuid })) }}>VWAP</button>
                <button onClick={(e) => { e.stopPropagation(); dispatch(setGraphVolumeControl({ uuid })) }}>Volume</button>
                <button onClick={(e) => { e.stopPropagation(); dispatch(setGraphVolumeProfileControl({ uuid })) }}>VP</button>


                <button onClick={(e) => { e.stopPropagation(); setShowChartStudyOverlaySelect(false) }}>Close</button>
            </div>
        </>
    )
}

export default ChartOverlayDropDown