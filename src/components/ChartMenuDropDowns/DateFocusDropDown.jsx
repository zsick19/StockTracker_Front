import React from 'react'
import { useDispatch } from 'react-redux'
import './ChartMenuStyles.css'
import { setFocusStartFinishDate } from '../../features/Charting/GraphMarketHourElement'
import { setResetXYZoomState } from '../../features/Charting/GraphHoverZoomElement'

function DateFocusDropDown({ uuid, setShowDateFocusSelect })
{
    const dispatch = useDispatch()


    return (
        <>
            <div className='DateFocusDropDownUnderlay' onClick={() => setShowDateFocusSelect(false)}></div>
            <div className='DateFocusDropDown'>
                <p>Today's Market</p>
                <fieldset onChange={(e) => { dispatch(setFocusStartFinishDate({ uuid, focusDates: e.target.value })); setShowDateFocusSelect(false) }}>
                    <input type="radio" name="focusPeriod" id="OMHO" value='OMHO' className='hiddenInput' />
                    <label htmlFor="OMHO" className='timeFrameDropLabel'>Market Hours</label>
                    <input type="radio" name="focusPeriod" id="PMPM" value='PMPM' className='hiddenInput' />
                    <label htmlFor="PMPM" className='timeFrameDropLabel'>Pre/Post</label>
                </fieldset>

                <fieldset onChange={(e) => { dispatch(setFocusStartFinishDate({ uuid, focusDates: e.target.value })); setShowDateFocusSelect(false) }}>
                    <input type="radio" name="focusPeriod" id="P2D" value='P2D' className='hiddenInput' />
                    <label htmlFor="P2D" className='timeFrameDropLabel'>Past 2 Days</label>

                    <input type="radio" name="focusPeriod" id="P3D" value='P3D' className='hiddenInput' />
                    <label htmlFor="P3D" className='timeFrameDropLabel'>Past 3 Days</label>

                    <input type="radio" name="focusPeriod" id="P5D" value='P5D' className='hiddenInput' />
                    <label htmlFor="P5D" className='timeFrameDropLabel'>Past 5 Days</label>
                </fieldset>

                <fieldset onChange={(e) => { dispatch(setFocusStartFinishDate({ uuid, focusDates: e.target.value })); setShowDateFocusSelect(false) }}>
                    <input type="radio" name="focusPeriod" id="P2D" value='P2W' className='hiddenInput' />
                    <label htmlFor="P2W" className='timeFrameDropLabel'>Past 2 Weeks</label>

                    <input type="radio" name="focusPeriod" id="P3D" value='P3W' className='hiddenInput' />
                    <label htmlFor="P3w" className='timeFrameDropLabel'>Past 3 Weeks</label>

                    <input type="radio" name="focusPeriod" id="P5D" value='P5M' className='hiddenInput' />
                    <label htmlFor="P5M" className='timeFrameDropLabel'>Past Month</label>

                    <input type="radio" name="focusPeriod" id="P5D" value='P5Q' className='hiddenInput' />
                    <label htmlFor="P5Q" className='timeFrameDropLabel'>Past Quarter</label>

                    <input type="radio" name="focusPeriod" id="P5D" value='P5HalfYear' className='hiddenInput' />
                    <label htmlFor="P5HalfYear" className='timeFrameDropLabel'>Past Half Year</label>

                    <input type="radio" name="focusPeriod" id="P5D" value='P5Year' className='hiddenInput' />
                    <label htmlFor="P5Year" className='timeFrameDropLabel'>Past Year</label>

                </fieldset>

                <button onClick={() => dispatch(setResetXYZoomState({ uuid }))}>Reset Zoom</button>
            </div>
        </>
    )
}

export default DateFocusDropDown