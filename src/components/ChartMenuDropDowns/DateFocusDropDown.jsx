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
                    <label htmlFor="OMHO" className='timeFrameDropLabel'>MH</label>

                    <input type="radio" name="focusPeriod" id="PMPM" value='PMPM' className='hiddenInput' />
                    <label htmlFor="PMPM" className='timeFrameDropLabel'>P/P</label>
                </fieldset>

                <fieldset onChange={(e) => { dispatch(setFocusStartFinishDate({ uuid, focusDates: e.target.value })); setShowDateFocusSelect(false) }}>
                    <input type="radio" name="focusPeriod" id="P2D" value='P2D' className='hiddenInput' />
                    <label htmlFor="P2D" className='timeFrameDropLabel'>2D</label>

                    <input type="radio" name="focusPeriod" id="P3D" value='P3D' className='hiddenInput' />
                    <label htmlFor="P3D" className='timeFrameDropLabel'>3D</label>

                    <input type="radio" name="focusPeriod" id="P5D" value='P5D' className='hiddenInput' />
                    <label htmlFor="P5D" className='timeFrameDropLabel'>5D</label>
                </fieldset>

                <fieldset onChange={(e) => { dispatch(setFocusStartFinishDate({ uuid, focusDates: e.target.value })); setShowDateFocusSelect(false) }}>
                    <input type="radio" name="focusPeriod" id="P2W" value='P2W' className='hiddenInput' />
                    <label htmlFor="P2W" className='timeFrameDropLabel'>2W</label>

                    <input type="radio" name="focusPeriod" id="P3w" value='P3W' className='hiddenInput' />
                    <label htmlFor="P3w" className='timeFrameDropLabel'>3W</label>

                    <input type="radio" name="focusPeriod" id="PM" value='PM' className='hiddenInput' />
                    <label htmlFor="PM" className='timeFrameDropLabel'>PM</label>

                    <input type="radio" name="focusPeriod" id="PQ" value='PQ' className='hiddenInput' />
                    <label htmlFor="PQ" className='timeFrameDropLabel'>PQ</label>

                    <input type="radio" name="focusPeriod" id="PHY" value='PHY' className='hiddenInput' />
                    <label htmlFor="PHY" className='timeFrameDropLabel'>HY</label>

                    <input type="radio" name="focusPeriod" id="PY" value='PY' className='hiddenInput' />
                    <label htmlFor="PY" className='timeFrameDropLabel'>PY</label>

                </fieldset>

                <button onClick={() => dispatch(setResetXYZoomState({ uuid }))}>Reset Zoom</button>
            </div>
        </>
    )
}

export default DateFocusDropDown