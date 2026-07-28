import { differenceInBusinessDays, format } from 'date-fns'
import React from 'react'

function BackTestPatternAverages({ plan, entryStrikeOrFloor })
{
    const planConfig = plan.planConfig
    const patternConfig = plan.patternConfig


    const entryBackTestAverage = plan.planConfig.backTestedValues.entryPrice.averages
    const floorBackTestAverage = plan.planConfig.backTestedValues.floorPrice.averages



    const riskRewardSpread = { risk: patternConfig.entryStrikeBuffer - planConfig.plan.stopLossPrice, reward: patternConfig.channelTop - patternConfig.entryStrikeBuffer }
    const idealRisk = ((riskRewardSpread.risk) / patternConfig.entryStrikeBuffer) * 100
    const idealReward = ((riskRewardSpread.reward) / patternConfig.entryStrikeBuffer) * 100
    const sharesWith1000 = Math.floor(1000 / patternConfig.entryStrikeBuffer)

    //     averageHoldTime: 0,
    //     averageMaxGain: 137.06,
    //     averageGainPercent: 13.05,
    //     averageMaxPain: 250,
    //     averagePainPercent: 23.81,
    //     averageMissGain: 0,
    //     averageSavedPain: 110,


    //     numberOfStoplossHitTrades: 17,

    //     numberOfClosedTrades: 0,
    //     numberOfOpenTrades: 17,
    //     totalNumberOfTrades: 17,

    //     tradesSinceTracking: 1,
    //     successfulOpportunitiesSinceTracking: 0,

    //     patternLength: 31,
    //     daysBetweenTrades: Array(16) [ 3, 1, 1, 1, 1, 2, 1, 1, 1, 4, 1, 1, 1, 1, 1, 7 ],
    //     daysBetweenSuccessfulTrades: [],

    //     averageDaysBetweenTrades: 1.75,
    //     averageDaysBetweenSuccessfulTrades: 0
    //     patternMaxGain: 48.45,
    //     patternMaxPain: 29.07,
    //     positionReward: 48.45,
    //     positionRisk: 9.69,

    //     lowestPatternValue: 3,
    //     highestPatternValue: 3.24

    const entryToFloorDaysBetweenSuccessfulTradesRatio = (entryBackTestAverage.averageDaysBetweenSuccessfulTrades === 0 || floorBackTestAverage.averageDaysBetweenSuccessfulTrades === 0) ?
        0 : entryBackTestAverage.averageDaysBetweenSuccessfulTrades / floorBackTestAverage.averageDaysBetweenSuccessfulTrades
    const averageDaysBetweenEntryAndFloor = entryBackTestAverage.averageDaysBetweenSuccessfulTrades - floorBackTestAverage.averageDaysBetweenSuccessfulTrades

    return (
        <div>
            <div id='AveragePriceCompares'>
                <div id='EntryPriceAverages'>
                    <h2>Entry Price</h2>
                    <p>Successful Trade Opportunities: {entryBackTestAverage.numberOfClosedTrades}/{entryBackTestAverage.totalNumberOfTrades}</p>
                    <p>Days Between Trade Opportunities: {entryBackTestAverage.averageDaysBetweenTrades} Days</p>
                    <p>Days Between Successful Trades: {entryBackTestAverage.averageDaysBetweenSuccessfulTrades} Days</p>
                    <div className='flex'>
                        <p className='gainGreen'>Greatest Gain: ${entryBackTestAverage.patternMaxGain}</p>
                        <p className='painRed'>Greatest Pain: -${entryBackTestAverage.patternMaxPain}</p>
                    </div>


                    <br />
                    <div>
                        <h2 className='gainGreen'>Average Max Gain: ${entryBackTestAverage.averageMaxGain}</h2>
                        <div className='flex'>
                            <p>Percent: <span className='gainGreen'>{entryBackTestAverage.averageGainPercent}%</span></p>
                            <p>Avg Missed Gain: <span className='missedSavedOrange'>-${entryBackTestAverage.averageMissGain}</span></p>
                        </div>
                    </div>
                    <br />
                    <div>
                        <h2 className='painRed'>Average Max Pain: -${entryBackTestAverage.averageMaxPain}</h2>
                        <div className='flex'>
                            <p>Percent: <span className='painRed'>-{entryBackTestAverage.averagePainPercent}%</span></p>
                            <p>Stoploss Saved Pain: <span className='missedSavedOrange'>${entryBackTestAverage.averageSavedPain}</span></p>
                        </div>
                    </div>
                </div>

                <div id='FloorPriceAverages'>
                    <h2>Floor Price</h2>
                    <p>Successful Trade Opportunities: {floorBackTestAverage.numberOfClosedTrades}/{floorBackTestAverage.totalNumberOfTrades}</p>
                    <p>Average Days Between Trade Opportunities: {floorBackTestAverage.averageDaysBetweenTrades} Days</p>
                    <p>Average Days Between Successful Trades: {floorBackTestAverage.averageDaysBetweenSuccessfulTrades} Days</p>
                    <div className='flex'>
                        <p className='gainGreen'>Greatest Gain: ${floorBackTestAverage.patternMaxGain}</p>
                        <p className='painRed'>Greatest Pain: -${floorBackTestAverage.patternMaxPain}</p>
                    </div>

                    <br />
                    <div>
                        <h2 className='gainGreen'>Average Max Gain: ${floorBackTestAverage.averageMaxGain}</h2>
                        <div className='flex'>
                            <p>Percent: <span className='gainGreen'>{floorBackTestAverage.averageGainPercent}%</span></p>
                            <p>Avg Missed Gain: <span className='missedSavedOrange'>-${floorBackTestAverage.averageMissGain.toFixed(2)}</span></p>
                        </div>
                    </div>
                    <br />
                    <div>
                        <h2 className='painRed'>Average Max Pain -${floorBackTestAverage.averageMaxPain}</h2>
                        <div className='flex'>
                            <p>Percent: <span className='painRed'>-{floorBackTestAverage.averagePainPercent}%</span></p>
                            <p>Stoploss Saved Pain: <span className='missedSavedOrange'>${floorBackTestAverage.averageSavedPain}</span></p>
                        </div>
                    </div>

                </div>

                <div>
                    <h2>On a $1000 position</h2>
                    <p>{entryToFloorDaysBetweenSuccessfulTradesRatio > 0.5 ?
                        <span className='FloorColor'>Floor Price is likely an extra {averageDaysBetweenEntryAndFloor.toFixed(2)} days away</span>
                        : <span className='EntryColor'>Better to stick closer to Entry Price</span>}
                    </p>

                    <br />
                    <p>Floor price yields <span className='gainGreen'>${(floorBackTestAverage.averageMaxGain - entryBackTestAverage.averageMaxGain).toFixed(2)}</span> extra average max gain</p>
                    <p>avoiding <span className='painRed'>${(floorBackTestAverage.averageMaxPain - entryBackTestAverage.averageMaxPain).toFixed(2)}</span> in possible average max pain</p>

                    <br />
                    <div className='flex'>
                        <div>
                            <p style={{ color: '#c70000' }}>${planConfig.plan.stopLossPrice}</p>
                            <p>Stop Loss</p>
                        </div>
                        <div>
                            <p style={{ color: '#00ffff' }}>${patternConfig.channelBottom}</p>
                            <p>Floor</p>
                        </div>
                        <div>
                            <p style={{ color: '#00ffff' }}>${patternConfig.entryStrikeBuffer}</p>
                            <p>Entry</p>
                        </div>
                        <div>
                            <p style={{ color: '#1ff029' }}>${patternConfig.channelTop}</p>
                            <p>Exit</p>
                        </div>
                    </div>
                    <br />
                    <div className='flex'>
                        <div>
                            <h2 className='EntryColor'>Entry RvR</h2>
                            <p>Reward: <span className='gainGreen'>${entryBackTestAverage.positionReward}</span></p>
                            <p>Risk: <span className='painRed'>-${entryBackTestAverage.positionRisk}</span></p>
                        </div>

                        <div>
                            <h2 className='FloorColor'>Floor Rvr</h2>
                            <p>Reward: <span className='gainGreen'>${floorBackTestAverage.positionReward}</span></p>
                            <p>Risk: <span className='painRed'>-${floorBackTestAverage.positionRisk}</span></p>
                        </div>

                    </div>

                </div>

            </div>

            <br />
            <br />

            <div className='flex'>
                <div>
                    <h2>Pattern</h2>
                    <p>Start Date: {format(planConfig.relevantCandleDate, 'MMM d')} - {differenceInBusinessDays(new Date(), planConfig.relevantCandleDate)} days</p>
                    <p>Average Hold: {entryStrikeOrFloor ? entryBackTestAverage.averageHoldTime : floorBackTestAverage.averageHoldTime} Days</p>
                    <p>Stoploss Hit Count: {entryStrikeOrFloor ? entryBackTestAverage.numberOfStoplossHitTrades : floorBackTestAverage.numberOfStoplossHitTrades}/
                        {entryStrikeOrFloor ? entryBackTestAverage.totalNumberOfTrades : floorBackTestAverage.totalNumberOfTrades}
                    </p>
                </div>
                <div>
                    <h2>Since Tracking</h2>
                    <p>Tracking for: {planConfig.trackingDays} Days since {format(planConfig.dateAdded, 'MMM d')}</p>
                    <p>Successful Trades: {entryStrikeOrFloor ? entryBackTestAverage.successfulOpportunitiesSinceTracking : floorBackTestAverage.successfulOpportunitiesSinceTracking}
                        /{entryStrikeOrFloor ? entryBackTestAverage.tradesSinceTracking : floorBackTestAverage.tradesSinceTracking}</p>
                </div>
                <br />
                <div>
                    <h2>General</h2>
                    <p>Requires 1 Min Candles: {patternConfig.maintainLiveCandles ? 'Yes' : 'No'}</p>
                    <p>Average True Range: ${planConfig.dailyCalculatedValues.atr}</p>
                    <p>Pattern Anchor Date: {format(patternConfig.anchorDate, 'MMM d')}</p>
                </div>
                <br />
                <div className='flex'>
                    <p>Lowest Price: ${entryBackTestAverage.lowestPatternValue.toFixed(2)}</p>
                    <p>Highest Price: ${entryBackTestAverage.highestPatternValue.toFixed(2)}</p>
                </div>
            </div>


        </div >
    )
}

export default BackTestPatternAverages