import React, { useState } from 'react'
import { activeTradeSelectors, useGetUsersActiveTradesQuery } from '../../../../../../../../features/Trades/TradeSliceApi'
import { setSelectedStockAndTimelineFourSplit, setSingleChartToTickerTimeFrameTradeId } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { ArrowUp, ChartCandlestick, ChevronDown, ChevronUp, CopySlash, Expand, X } from 'lucide-react'
import VerticalPlanDiagram from './VerticalPlanDiagram'
import VerticalMoveDiagram from './VerticalMoveDiagram'
import { differenceInBusinessDays } from 'date-fns'

function SingleActiveTradeBlock({ id })
{
    const dispatch = useDispatch()
    const [showStopEnterExit, setShowStopEnterExit] = useState(0)
    const [showPositionInfo, setShowPositionInfo] = useState(0)
    const [showTradeOptions, setShowTradeOptions] = useState(false)

    const { activeTrade } = useGetUsersActiveTradesQuery(undefined, { selectFromResult: ({ data }) => ({ activeTrade: data ? activeTradeSelectors.selectById(data, id) : undefined }) })

    const handleStockToFourWay = () =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: activeTrade.tickerSymbol, trade: activeTrade }))
    }
    const handleStockToTradeChart = () =>
    {
        dispatch(setStockDetailState(8))
        dispatch(setSingleChartToTickerTimeFrameTradeId({ tickerSymbol: activeTrade.tickerSymbol, chartId: activeTrade.enterExitPlanId, planId: activeTrade.enterExitPlanId, trade: activeTrade }))
    }

    return (
        <div className={`LSH-ActiveTradeBlock ${activeTrade.classVisual}`}>
            <div className='VerticalPlanDiagrams'>
                <VerticalPlanDiagram idealPrices={activeTrade.tradingPlanPrices} currentPrice={activeTrade.mostRecentPrice} />
                <VerticalMoveDiagram currentPrice={activeTrade.mostRecentPrice} percentOfGain={activeTrade.percentOfGain} />
            </div>

            <div className='TradeInfoSection'>
                <div>

                    <div className='PriceTickerInfo'>
                        <h2 onClick={() => { setShowTradeOptions(prev => !prev); }}>{activeTrade.tickerSymbol}</h2>
                        <div className='PriceMovementPerTrade' onClick={() => handleStockToTradeChart()}>
                            <h2>${activeTrade.mostRecentPrice.toFixed(2)}</h2>
                            {activeTrade.priceDirection === 'negativeDirection' && < ChevronDown size={18} color='red' />}
                            {activeTrade.priceDirection === 'positiveDirection' && <ChevronUp size={18} color='green' />}
                        </div>
                    </div>


                    {showTradeOptions ?
                        <div className='TradeOptionControl'>
                            <button onClick={() => handleStockToFourWay()} className='iconButton'><p>1/4</p><CopySlash color='red' size={16} /></button>
                            <button onClick={() => handleStockToFourWay()} className='iconButton'><p>1/2</p><CopySlash color='red' size={16} /></button>
                            <button onClick={() => handleStockToFourWay()} className='iconButton'><p>All</p><CopySlash color='red' size={16} /></button>
                            <button onClick={() => setShowTradeOptions(false)} className='iconButton'> <X color='white' size={16} /></button>

                        </div>
                        : <div className='TimeFrameOptions'>
                            <button onClick={() => handleStockToFourWay()} className='timeFrameButton'>1M</button>
                            <button onClick={() => handleStockToFourWay()} className='timeFrameButton'>2M</button>
                            <button onClick={() => handleStockToFourWay()} className='timeFrameButton'>5M</button>
                            <button onClick={() => handleStockToFourWay()} className='timeFrameButton'>1H</button>
                            <button onClick={() => handleStockToFourWay()} className='timeFrameButton'>4H</button>
                            <button onClick={() => handleStockToFourWay()} className='iconButton'><Expand color='white' size={16} /></button>
                        </div>
                    }

                </div>
                <div>
                    {showStopEnterExit === 0 ?
                        <div className={activeTrade.percentFromOpen >= 0 ? 'activeTradePositive currentPL' : 'activeTradeNegative currentPL'} onClick={() => setShowStopEnterExit(1)}>
                            <h2>{activeTrade.percentFromOpen > 0 && '+'}{activeTrade.percentFromOpen.toFixed(2)}%</h2>
                            <div>
                                <p>GPS: ${activeTrade.gainPerShare.toFixed(2)}</p>
                                <p>Position Size: {activeTrade.availableShares}</p>
                            </div>
                        </div> : showStopEnterExit === 1 ?
                            <div className='PlanStopEnterExit' onClick={() => setShowStopEnterExit(2)}>
                                <div>
                                    <p>${activeTrade.tradingPlanPrices[0]}</p>
                                    <p>StopLoss</p>
                                </div>
                                <div>
                                    <p>${activeTrade.tradingPlanPrices[1]}</p>
                                    <p>Enter</p>
                                </div>
                                <div>
                                    <p>${activeTrade.tradingPlanPrices[2]}</p>
                                    <p>Enter Buffer</p>
                                </div>
                            </div> :
                            showStopEnterExit === 2 ?

                                <div className='PlanStopEnterExit' onClick={() => setShowStopEnterExit(3)}>
                                    <div>
                                        <p>${activeTrade.tradingPlanPrices[3]}</p>
                                        <p>Exit Buffer</p>
                                    </div>
                                    <div>
                                        <p>${activeTrade.tradingPlanPrices[4]}</p>
                                        <p>Exit {activeTrade.percentFromPlanPrices[3].toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p>${activeTrade.tradingPlanPrices[5]}</p>
                                        <p>Moon Shot</p>
                                    </div>
                                </div>
                                : <div className='PlanStopEnterExit' onClick={() => setShowStopEnterExit(0)}>
                                    <div>Risk</div>
                                    <p>{activeTrade.idealPercents[0]}% vs {activeTrade.idealPercents[3]}%</p>
                                    <div>Reward</div>
                                </div>
                    }
                    <div className={activeTrade.percentFromOpen >= 0 ? 'moveCapturePositive MoveCaptured' : 'moveCaptureNegative MoveCaptured'}>
                        <p>{activeTrade.percentOfGain.toFixed(2)}% E/X Captured</p>
                    </div>
                </div>
                {showPositionInfo === 0 ?
                    <div className='flex'>
                        <p onClick={() => setShowPositionInfo(1)}>Total P/L: ${(activeTrade.gainPerShare * activeTrade.availableShares).toFixed(2)}</p>
                        <p onClick={() => setShowPositionInfo(2)}>Market Value: ${(activeTrade.availableShares * activeTrade.mostRecentPrice).toFixed(2)}</p>
                    </div> :
                    showPositionInfo === 1 ?
                        <div className='flex' onClick={() => setShowPositionInfo(0)}>
                            <p >{activeTrade.sector}</p>
                            <p>Hold Days: {differenceInBusinessDays(new Date(), activeTrade.enterDate)}</p>
                        </div>
                        :
                        <div className='flex' onClick={() => setShowPositionInfo(0)}>
                            <p>Ideal Risk: ${((activeTrade.tradingPlanPrices[1] - activeTrade.tradingPlanPrices[0]) * activeTrade.availableShares).toFixed(2)}</p>
                            <p>Ideal Reward: ${((activeTrade.tradingPlanPrices[4] - activeTrade.tradingPlanPrices[1]) * activeTrade.availableShares).toFixed(2)}</p>
                        </div>

                }
            </div>


        </div>)
}

export default SingleActiveTradeBlock