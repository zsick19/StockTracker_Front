import React, { useState } from 'react'
import BackTestTimeLineChart from '../SubComponents/BackTestTimeLineChart'
import EntryGainPainChartWrapper from '../SubComponents/EntryGainPainChartWrapper'
import BackTestPatternAverages from '../SubComponents/BackTestPatternAverages'
import { ArrowDownFromLine, ArrowDownToLine } from 'lucide-react'

function PatternReview({ plan })
{
    const planConfig = plan.planConfig
    const patternConfig = plan.patternConfig

    const entryBackTests = plan.planConfig.backTestedValues.entryPrice.backTests
    const entryBackTestAverage = plan.planConfig.backTestedValues.entryPrice.averages
    const floorBackTests = plan.planConfig.backTestedValues.floorPrice.backTests
    const floorBackTestAverage = plan.planConfig.backTestedValues.floorPrice.averages



    const [showEntryOrFloor, setShowEntryOrFloor] = useState(0)
    const [patternOrStockChart, setPatternOrStockChart] = useState({ display: false })

    return (
        <div id='PatternReviewExpanded'>
            {patternOrStockChart.display ?
                <EntryGainPainChartWrapper plan={plan} patternOrStockChart={patternOrStockChart}
                    entryDate={patternOrStockChart.entryDate} maxGainDate={patternOrStockChart.maxGainDate}
                    maxPainDate={patternOrStockChart.maxPainDate} setPatternOrStockChart={setPatternOrStockChart}
                    pricePoints={showEntryOrFloor === 0 ? { entryPrice: patternConfig.entryStrikeBuffer, stopLossPrice: planConfig.plan.stopLossPrice, exitPrice: patternConfig.channelTop }
                        : { entryPrice: patternConfig.channelBottom, stopLossPrice: planConfig.plan.stopLossPrice, exitPrice: patternConfig.channelTop }}
                />
                :
                showEntryOrFloor !== 2 ?
                    <BackTestPatternAverages plan={plan} entryStrikeOrFloor={showEntryOrFloor === 0} /> :
                    <div>Custom stats</div>
            }

            <div id='PatternBackTest'>

                <div>
                    <button onClick={() => setShowEntryOrFloor(0)}><ArrowDownToLine color='blue' />Entry</button>
                    <button onClick={() => setShowEntryOrFloor(1)}><ArrowDownToLine color='orange' />Floor</button>
                    <button disabled onClick={() => setShowEntryOrFloor(2)}>Custom</button>
                </div>
                {showEntryOrFloor !== 2 ?
                    <BackTestTimeLineChart backTests={showEntryOrFloor === 0 ? entryBackTests : floorBackTests}
                        relevantCandleDate={planConfig.relevantCandleDate} entryPriceDisplay={showEntryOrFloor === 0}
                        backTestAverage={showEntryOrFloor === 0 ? entryBackTestAverage : floorBackTestAverage}
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