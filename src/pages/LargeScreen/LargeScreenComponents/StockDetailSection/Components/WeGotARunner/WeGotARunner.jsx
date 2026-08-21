import React, { useEffect, useState } from 'react'
import { useClearNewsRunnerDataMutation } from '../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import CurrentRunnersList from './Components/CurrentRunnersList'
import RunnerChartWrapper from './Components/RunnerChartWrapper'
import TradeAndQuoteWrapper from './Components/TradeAndQuoteWrapper'
import './WeGotARunner.css'
import RunnerChart from './Components/RunnerChart'
import { VisualSqueezePanel } from './Components/VisualSqueezeSummaryPanel'
import AllNewsRunnerSmallDisplay from './Components/AllNewsRunnerSmallDisplay'
import { markNewsRunnerActive, selectExitProofById, selectNewsRunnerLargeSmallOrderById } from '../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { useDispatch, useSelector } from 'react-redux'
import OrderSizeVisual from './Components/OrderSizeVisual'
import { OrderVelocityAcceleration } from './Components/OrderVelocityAcceleration'
import SkyRocketCheck from './Components/SkyRocketCheck'
import NewsDetail from './Components/NewsDetail'
import { AbsorptionCoilPanel } from './Components/AbsorptionCoilPanel'
import ProofOrderSizeVisualWrapper from './Components/ProofOrderSizeVisualWrapper'

function WeGotARunner({ tickerSymbol })
{
    const dispatch = useDispatch()
    const [tickerForStream, setTickerForStream] = useState(tickerSymbol)

    useEffect(() => { setTickerForStream(tickerSymbol) }, [tickerSymbol])

    const [clearNewsRunnerData] = useClearNewsRunnerDataMutation()
    async function attemptClearingNewsRunner()
    {
        try
        {
            const results = await clearNewsRunnerData({ tickerSymbol: tickerForStream }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    const exitProof = useSelector((state) => selectExitProofById(state, tickerForStream))

    const [showSqueezePanel, setShowSqueezePanel] = useState(false)

    return (
        <div id='WeGotARunner'>
            <div id='ChartAndCurrentRunners'>
                <RunnerChartWrapper ticker={tickerForStream} />
                <div id='RunnerStatusPanel'>
                    {showSqueezePanel ?
                        <VisualSqueezePanel ticker={tickerForStream} /> :
                        <AbsorptionCoilPanel ticker={tickerForStream} elapsedSeconds={45} />
                    }
                    <div>
                        <button onClick={() => dispatch(markNewsRunnerActive({ Symbol: tickerForStream }))}>Mark Active</button>
                        <button onClick={() => attemptClearingNewsRunner()}>Clear</button>
                        <button onClick={() => setShowSqueezePanel(prev => !prev)}>{showSqueezePanel ? 'Absorption' : 'Squeeze'}</button>
                    </div>
                    <AllNewsRunnerSmallDisplay />
                </div>
            </div>
            <div id='QuoteTradeArticleContainer'>
                <ProofOrderSizeVisualWrapper ticker={tickerForStream} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <OrderVelocityAcceleration ticker={tickerForStream} />
                    <SkyRocketCheck ticker={tickerForStream} />
                </div>
            </div>
            <NewsDetail ticker={tickerForStream} />
        </div>
    )
}

export default WeGotARunner