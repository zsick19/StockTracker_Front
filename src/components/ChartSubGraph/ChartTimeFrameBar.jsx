import React, { useState } from "react";
import { defaultTimeFrames } from "../../Utilities/TimeFrames";

function ChartTimeFrameBar({ ticker, setTimeFrame, timeFrame, subCharts, setSubCharts })
{
  const [showTimeFrameModal, setShowTimeFrameModal] = useState(false)

  function handlePreDefinedTimeSelection(e)
  {
    switch (e.target.value)
    {
      case "3D1M": setTimeFrame(defaultTimeFrames.threeDayOneMin); break;
      case "3D2M": setTimeFrame(defaultTimeFrames.threeDayTwoMin); break;
      case "3D5M": setTimeFrame(defaultTimeFrames.threeDayFiveMin); break;
      case "3D15M": setTimeFrame(defaultTimeFrames.threeDayFifteenMin); break;
      case "3D30M": setTimeFrame(defaultTimeFrames.threeDayThirtyMin); break;
      case "3D1H": setTimeFrame(defaultTimeFrames.threeDayOneHour); break;
      case "4H1Y": setTimeFrame(defaultTimeFrames.fourHourOneYear); break;
      case "1W1Y": setTimeFrame(defaultTimeFrames.weeklyOneYear); break;
      case "1D1Y": setTimeFrame(defaultTimeFrames.dailyOneYear); break;
    }
    setShowTimeFrameModal(false)
  }

  function provideTimeFrameDurationText()
  {
    if (timeFrame.unitOfDuration === 'D') return ''
    else return `:${timeFrame.duration}${timeFrame.unitOfDuration}`
  }
  return <nav className="ChartTimeFrameBar">
    <p>{ticker}</p>
    <div className="TimeFrameDropDown">
      <button onClick={() => setShowTimeFrameModal(prev => !prev)}>{`${timeFrame.increment}${timeFrame.unitOfIncrement}${provideTimeFrameDurationText()}      `}</button>

      {showTimeFrameModal &&
        <div className="ChartTimeFrameDropDownSelect">
          <h4>Time Frame Select</h4>

          <form onChange={(e) => handlePreDefinedTimeSelection(e)} className="PreDefinedTimeFrameRadioButtons">
            <div>
              <input type="radio" name="" id="3D1M" className="visually-hidden" value='3D1M' />
              <label htmlFor="3D1M">1M</label>
            </div>
            <div>
              <input type="radio" name="" id="3D2M" className="visually-hidden" value="3D2M" />
              <label htmlFor="3D2M">2M</label>
            </div>
            <div>
              <input type="radio" name="" id="3D5M" className="visually-hidden" value="3D5M" />
              <label htmlFor="3D5M">5M</label>
            </div>
            <div>
              <input type="radio" name="" id="3D15M" className="visually-hidden" value="3D15M" />
              <label htmlFor="3D15M">15M</label>
            </div>
            <div>
              <input type="radio" name="" id="3D30M" className="visually-hidden" value="3D30M" />
              <label htmlFor="3D30M">30M</label>
            </div>
            <div>
              <input type="radio" name="" id="3D1H" className="visually-hidden" value="3D1H" />
              <label htmlFor="3D1H">1H</label>
            </div>
          </form>

          <form onChange={(e) => handlePreDefinedTimeSelection(e)} className="PreDefinedTimeFrameRadioButtons">
            <div>
              <input type="radio" name="" id="4H:1Y" className="visually-hidden" value="4H1Y" />
              <label htmlFor="4H:1Y">4H:1Y</label>
            </div>
            <div>
              <input type="radio" name="" id="1D:1Y" className="visually-hidden" value="1D1Y" />
              <label htmlFor="1D:1Y">1D:1Y</label>
            </div>
            <div>
              <input type="radio" name="" id="1W:1Y" className="visually-hidden" value="1W1Y" />
              <label htmlFor="1W:1Y">1W:1Y</label>
            </div>
          </form>

          <form>
            <div>
              <label htmlFor="duration">Duration</label>
              <input type="number" id="duration" />
              <select name="" id="">
                <option value="">Hour</option>
                <option value="">Day</option>
              </select>
            </div>


          </form>

          <button onClick={() => setShowTimeFrameModal(false)}>Cancel</button>
        </div>
      }
    </div >
  </nav >;
}

export default ChartTimeFrameBar;
