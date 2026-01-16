import React, { useState } from 'react'
import { activeTradeSelectors, useGetUsersActiveTradesQuery } from '../../../../../../../../features/Trades/TradeSliceApi'
import { setSelectedStockAndTimelineFourSplit, setSingleChartToTickerTimeFrameTradeId } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { ArrowUp, ChartCandlestick, ChevronDown, CopySlash, Expand, X } from 'lucide-react'
import VerticalPlanDiagram from './VerticalPlanDiagram'
import VerticalMoveDiagram from './VerticalMoveDiagram'

function SingleActiveTradeBlock({ id })
{
    const dispatch = useDispatch()
    const { activeTrade } = useGetUsersActiveTradesQuery(undefined, { selectFromResult: ({ data }) => ({ activeTrade: data ? activeTradeSelectors.selectById(data, id) : undefined }) })

    const handleStockToFourWay = () =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: activeTrade.tickerSymbol, trade: activeTrade }))
    }
    const handleStockToTradeChart = () =>
    {
        dispatch(setStockDetailState(8))
        dispatch(setSingleChartToTickerTimeFrameTradeId({ ticker: activeTrade.tickerSymbol, chartId: activeTrade.enterExitPlanId, planId: activeTrade.enterExitPlanId, trade: activeTrade }))
    }
    console.log(activeTrade)
    const [showTradeOptions, setShowTradeOptions] = useState(false)
    const [showStopEnterExit, setShowStopEnterExit] = useState(false)
    const [showPositionInfo, setShowPositionInfo] = useState(false)
    return (
        <div className='LSH-ActiveTradeBlock'>
            <div className='VerticalPlanDiagrams'>
                <VerticalPlanDiagram idealPrices={activeTrade.tradingPlanPrices} currentPrice={activeTrade.mostRecentPrice} />
                <VerticalMoveDiagram currentPrice={activeTrade.mostRecentPrice} percentOfGain={activeTrade.percentOfGain} />
            </div>

            <div className='TradeInfoSection'>
                <div>

                    <div className='PriceTickerInfo'>
                        <h2 onClick={() => { setShowTradeOptions(prev => !prev); }}>{activeTrade.tickerSymbol}</h2>
                        <div className='PriceMovementPerTrade'>
                            <h2 onClick={() => handleStockToTradeChart()}>${activeTrade.mostRecentPrice.toFixed(2)}</h2>
                            <ChevronDown size={18} />
                        </div>
                        <p>4.3%</p>
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
                    {showStopEnterExit ?
                        <div className='PlanStopEnterExit' onClick={() => setShowStopEnterExit(prev => !prev)}>
                            <div>
                                <p>{activeTrade.percentFromPlanPrices[0].toFixed(2)}%</p>
                                <p>StopLoss</p>
                                <p>${activeTrade.tradingPlanPrices[0]}</p>
                            </div>
                            <div>
                                <p>+1%</p>
                                <p>Enter</p>
                                <p>${activeTrade.tradingPlanPrices[1]}</p>
                            </div>
                            <div>
                                <p>-23%</p>
                                <p>Exit</p>
                                <p>${activeTrade.tradingPlanPrices[4]}</p>
                            </div>
                        </div> :
                        <div className='CurrentPL' onClick={() => setShowStopEnterExit(prev => !prev)}>
                            <h2>{activeTrade.percentFromOpen > 0 && '+'}{activeTrade.percentFromOpen.toFixed(2)}%</h2>
                            <div>
                                <p>Per Share: ${activeTrade.gainPerShare.toFixed(2)}</p>
                                <p>Total P/L:${(activeTrade.gainPerShare * activeTrade.availableShares).toFixed(2)}</p>
                            </div>
                        </div>
                    }
                    <div className='MoveCaptured'>
                        <p>{activeTrade.percentOfGain.toFixed(2)}% E/x Move Captured</p>
                    </div>
                </div>
                {showPositionInfo ?
                    <div className='flex' onClick={() => setShowPositionInfo(false)}>
                        <p>Technology</p>
                        <p>Hold: 2 Days</p>
                    </div>
                    : <div className='flex' onClick={() => setShowPositionInfo(true)}>
                        <p>Position Size: {activeTrade.availableShares}</p>
                        <p>Total: ${(activeTrade.availableShares * activeTrade.mostRecentPrice).toFixed(2)}</p>
                    </div>
                }
            </div>


        </div>)
}

export default SingleActiveTradeBlock