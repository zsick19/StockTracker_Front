import React, { useState } from 'react'

import BackTestTimeLineChart from '../SubComponents/BackTestTimeLineChart'
import EntryGainPainChartWrapper from '../SubComponents/EntryGainPainChartWrapper'

function PatternReview({ plan })
{
    const planConfig = plan.planConfig
    const patternConfig = plan.patternConfig

    const entryBackTests = plan.planConfig.backTestedValues.entryPrice.backTests
    const entryBackTestAverage = plan.planConfig.backTestedValues.entryPrice.averages
    const floorBackTests = plan.planConfig.backTestedValues.floorPrice.backTests
    const floorBackTestAverage = plan.planConfig.backTestedValues.floorPrice.averages




    const riskRewardSpread = { risk: patternConfig.entryStrikeBuffer - planConfig.plan.stopLossPrice, reward: patternConfig.channelTop - patternConfig.entryStrikeBuffer }
    const idealRisk = ((riskRewardSpread.risk) / patternConfig.entryStrikeBuffer) * 100
    const idealReward = ((riskRewardSpread.reward) / patternConfig.entryStrikeBuffer) * 100
    const sharesWith1000 = Math.floor(1000 / patternConfig.entryStrikeBuffer)


    const [showEntryOrFloor, setShowEntryOrFloor] = useState(0)
    const [patternOrStockChart, setPatternOrStockChart] = useState({ display: false })

    return (
        <div id='PatternReviewExpanded'>
            {patternOrStockChart.display ?
                <EntryGainPainChartWrapper plan={plan} patternOrStockChart={patternOrStockChart}
                    entryDate={patternOrStockChart.entryDate} maxGainDate={patternOrStockChart.maxGainDate}
                    maxPainDate={patternOrStockChart.maxPainDate} setPatternOrStockChart={setPatternOrStockChart} />
                : <div>
                    <p>Tracking for: {planConfig.trackingDays} Days</p>
                    <p>RSI:{planConfig.dailyCalculatedValues.rsi}</p>
                    <p>ATR:{planConfig.dailyCalculatedValues.atr}</p>

                    <p>Pattern Relevant Date: {planConfig.relevantCandleDate}</p>
                    <p>Requires 1 Min Candles: {patternConfig.maintainLiveCandles ? 'yes' : 'no'}</p>

                    <br />
                    {/* <p>Pattern Type: {patternConfig.patternClassification}</p>
                    {patternConfig.patternClassification === 'channel' &&
                    <div>
                    <p>Channel Type:{patternConfig.channelType}</p>
                    <p>Anchor Date: {patternConfig.anchorDate}</p>
                    
                    <br />
                    <div className='flex'>
                    <p>Channel Bottom: {patternConfig.channelBottom}</p>
                    <p>Channel Top: {patternConfig.channelTop}</p>
                    <p>Channel Height: {patternConfig.channelHeight}</p>
                    <p>Strike Price: {patternConfig.entryStrikeBuffer}</p>
                    <p>Stoploss Price: {planConfig.plan.stopLossPrice}</p>
                    </div>
                    
                    <br />
                    <p>Ideal RvR</p>
                    <div className='flex'>
                    <p>Risk: {idealRisk.toFixed(2)}%  -${(sharesWith1000 * riskRewardSpread.risk).toFixed(2)}</p>
                    <p>Reward: {idealReward.toFixed(2)}% ${(sharesWith1000 * riskRewardSpread.reward).toFixed(2)}</p>
                    <p>{(idealReward / idealRisk).toFixed(2)}x risk to reward ratio</p>
                    </div>
                    </div>
                    } */}
                </div>}

            <div id='PatternBackTest'>

                <div>
                    <button onClick={() => setShowEntryOrFloor(0)}>Entry</button>
                    <button onClick={() => setShowEntryOrFloor(1)}>Floor</button>
                    <button onClick={() => setShowEntryOrFloor(2)}>Custom</button>
                </div>
                {showEntryOrFloor !== 2 ?
                    <BackTestTimeLineChart backTests={showEntryOrFloor === 0 ? entryBackTests : floorBackTests}
                        relevantCandleDate={planConfig.relevantCandleDate} entryPriceDisplay={showEntryOrFloor === 0}
                        entry={showEntryOrFloor === 0 ? patternConfig.entryStrikeBuffer : patternConfig.channelBottom}
                        exit={patternConfig.channelTop} stopLoss={planConfig.plan.stopLossPrice} setPatternOrStockChart={setPatternOrStockChart}
                    />
                    : <div>
                        custom price
                    </div>}

            </div>

        </div>
    )
}

export default PatternReview