import React, { useRef, useState } from 'react'
import '../ChartSubGraph.css'
import CorrelationChartWrapper from './CorrelationChartWrapper'

function CorrelationSubChart({ candleData, uuid, timeFrame })
{
    const secondInputRef = useRef()
    const [secondTicker, setSecondTicker] = useState(undefined)
    const [displayTickerInput, setDisplayTickerInput] = useState(true)


    return (
        <div className='SubChartContainer'>
            <div className='subChartGraph'>
                {displayTickerInput ? <>
                    <div className='subChartWithVerticalTitle'>
                        <p>Correlation</p>
                        <svg className='subChartYAxis'></svg>
                    </div>
                    <div>
                        <input type="text" ref={secondInputRef} />
                        <button onClick={() => { setSecondTicker(secondInputRef.current.value); setDisplayTickerInput(false) }}>Submit</button>
                        <button onClick={() => { setSecondTicker('SPY'); setDisplayTickerInput(false) }}>SPY</button>
                    </div>
                </> :
                    <CorrelationChartWrapper ticker1Data={candleData} ticker2={secondTicker} uuid={uuid} timeFrame={timeFrame} setDisplayTickerInput={setDisplayTickerInput} />
                }
            </div>
        </div>
    )
}

export default CorrelationSubChart