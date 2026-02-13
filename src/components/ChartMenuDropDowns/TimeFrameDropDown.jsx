import React from 'react'
import './TimeFrameDropDown.css'

function TimeFrameDropDown({ handleTimeFrameChange, setShowTimeFrameSelect })
{
    return (
        <>
            <div className='LSH-TimeFrameDropDownUnderlay' onClick={() => setShowTimeFrameSelect(false)}></div>
            <div className='LSH-TimeFrameDropDown'>
                <fieldset onChange={(e) => handleTimeFrameChange(e)}>

                    <input type="radio" name="timeFrameIntra" id="1m" value={1} className='hiddenInput' />
                    <label htmlFor="1m" className='timeFrameDropLabel'>1M</label>

                    <input type="radio" name="timeFrameIntra" id="2m" value={2} className='hiddenInput' />
                    <label htmlFor="2m" className='timeFrameDropLabel'>2M</label>

                    <input type="radio" name="timeFrameIntra" id="5m" value={5} className='hiddenInput' />
                    <label htmlFor="5m" className='timeFrameDropLabel'>5M</label>

                    <input type="radio" name="timeFrameIntra" id="15m" value={15} className='hiddenInput' />
                    <label htmlFor="15m" className='timeFrameDropLabel'>15M</label>

                    <input type="radio" name="timeFrameIntra" id="30m" value={30} className='hiddenInput' />
                    <label htmlFor="30m" className='timeFrameDropLabel'>30M</label>

                    <input type="radio" name="timeFrameHour" id="1H" value={1} className='hiddenInput' />
                    <label htmlFor="1H" className='timeFrameDropLabel'>1H</label>
                </fieldset>
                
                <fieldset onChange={(e) => handleTimeFrameChange(e)}>

                    <input type="radio" name="timeFrameDay" id="1d" value={1} className='hiddenInput' />
                    <label htmlFor="1d" className='timeFrameDropLabel'>1D</label>

                    <input type="radio" name="timeFrameWeek" id="1w" value={1} className='hiddenInput' />
                    <label htmlFor="1w" className='timeFrameDropLabel'>1W</label>
                </fieldset>
            </div>
        </>
    )
}

export default TimeFrameDropDown