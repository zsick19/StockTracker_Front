import React, { useEffect, useState } from 'react'
import { useClearNewsRunnerDataMutation } from '../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import CurrentRunnersList from './Components/CurrentRunnersList'
import RunnerChartWrapper from './Components/RunnerChartWrapper'
import TradeAndQuoteWrapper from './Components/TradeAndQuoteWrapper'
import './WeGotARunner.css'

function WeGotARunner({ tickerSymbol })
{
    const [tickerForStream, setTickerForStream] = useState(tickerSymbol)

    useEffect(() =>
    {
        setTickerForStream(tickerSymbol)
    }, [tickerSymbol])


    return (
        <div id='WeGotARunner'>
            <div id='ChartAndCurrentRunners'>
                <RunnerChartWrapper tickerForStream={tickerForStream} />
                <CurrentRunnersList tickerForStream={tickerForStream} setTickerForStream={setTickerForStream} />

            </div>
            <TradeAndQuoteWrapper tickerForStream={tickerForStream} />


        </div>
    )
}

export default WeGotARunner