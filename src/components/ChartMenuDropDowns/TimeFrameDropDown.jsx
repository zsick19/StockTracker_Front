import React from 'react'
import './TimeFrameDropDown.css'

function TimeFrameDropDown({ handleTimeFrameChange, setShowTimeFrameSelect })
{
    return (
        <>
            <div className='LSH-TimeFrameDropDownUnderlay' onClick={() => setShowTimeFrameSelect(false)}></div>
            <fieldset className='LSH-TimeFrameDropDown' onChange={(e) => handleTimeFrameChange(e)}>
                <div>
                    <label htmlFor="1m">1M</label>
                    <input type="radio" name="timeFrameIntra" id="1m" value={1} />
                </div>
                <div>
                    <label htmlFor="2m">2M</label>
                    <input type="radio" name="timeFrameIntra" id="2m" value={2} />
                </div>
                <div>
                    <label htmlFor="5m">5M</label>
                    <input type="radio" name="timeFrameIntra" id="5m" value={5} />
                </div>
                <div>
                    <label htmlFor="15m">15M</label>
                    <input type="radio" name="timeFrameIntra" id="15m" value={15} />
                </div>
                <div>
                    <label htmlFor="30m">30M</label>
                    <input type="radio" name="timeFrameIntra" id="30m" value={30} />
                </div>
                <div>
                    <label htmlFor="1H">1H</label>
                    <input type="radio" name="timeFrameHour" id="1H" value={1} />
                </div>
                <div>
                    <label htmlFor="1d">1D</label>
                    <input type="radio" name="timeFrameDay" id="1d" value={1} />
                </div>
                <div>
                    <label htmlFor="1w">1W</label>
                    <input type="radio" name="timeFrameWeek" id="1w" value={1} />
                </div>
            </fieldset>
        </>
    )
}

export default TimeFrameDropDown