import React, { useMemo, useRef, useState } from 'react'
import { activeTradeSelectors, useAlterTradeRecordMutation, useGetUsersActiveTradesQuery } from '../../../../../../../../features/Trades/TradeSliceApi'
import { setSelectedStockAndTimelineFourSplit, setSelectedStockAndTimelineFourSplitWithSector, setSingleChartToTickerTimeFrameTradeId } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { ChevronDown, ChevronUp, CopySlash, Expand, X } from 'lucide-react'
import VerticalPlanDiagram from './VerticalPlanDiagram'
import VerticalMoveDiagram from './VerticalMoveDiagram'
import { differenceInBusinessDays } from 'date-fns'
import { selectMacroTickersAndChartIds } from '../../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import MiniGraphChartWrapper from './MiniGraphChartWrapper'

function SingleActiveTradeBlock({ id })
{
    const dispatch = useDispatch()
    const liquidatePrice = useRef()
    const [showStopEnterExit, setShowStopEnterExit] = useState(0)
    const [showPositionInfo, setShowPositionInfo] = useState(0)
    const [showTradeOptions, setShowTradeOptions] = useState(false)

    const { activeTrade } = useGetUsersActiveTradesQuery(undefined, { selectFromResult: ({ data }) => ({ activeTrade: data ? activeTradeSelectors.selectById(data, id) : undefined }) })
    const [alterTradeRecord] = useAlterTradeRecordMutation()

    const macroToChartMemo = useMemo(selectMacroTickersAndChartIds, [])
    const macroToChartId = useSelector(state => macroToChartMemo(state))

    const handleStockToFourWay = () =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: activeTrade.tickerSymbol, chartId: activeTrade.enterExitPlanId, trade: activeTrade }))
    }
    const handleStockToFourWaySector = () =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplitWithSector({ ticker: activeTrade.tickerSymbol, chartId: activeTrade.enterExitPlanId, sectorChartId: macroToChartId[activeTrade.sector], sector: activeTrade.sector, trade: activeTrade }))

    }
    const handleStockToTradeChart = () =>
    {
        dispatch(setStockDetailState(8))
        dispatch(setSingleChartToTickerTimeFrameTradeId({ tickerSymbol: activeTrade.tickerSymbol, chartId: activeTrade.enterExitPlanId, planId: activeTrade.enterExitPlanId, trade: activeTrade }))
    }

    async function liquidateFullPosition()
    {
        let price = parseFloat(liquidatePrice.current.value)

        if (!price || price > (activeTrade.mostRecentPrice * 1.2) || price < (activeTrade.mostRecentPrice * 0.8)) return

        try
        {
            let results = await alterTradeRecord({
                action: 'closeAll',
                tickerSymbol: activeTrade.tickerSymbol,
                tradeId: activeTrade._id,
                tradePrice: price,
                positionSizeOfAlter: activeTrade.availableShares
            })
        } catch (error)
        {
            console.log(error)
        }

    }

    const [showGainPercentOrGPP, setShowGainPercentOrGPP] = useState(0)
    const [showMiniGraph, setShowMiniGraph] = useState(false)
    return (<>
        {showMiniGraph ? <MiniGraphChartWrapper setShowMiniGraph={setShowMiniGraph} activeTrade={activeTrade} /> :
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
                                <h2 className={activeTrade?.todaysGain > 0 ? 'positiveDirection' : 'negativeDirection'}>${activeTrade.mostRecentPrice.toFixed(2)}</h2>
                                {activeTrade.priceDirection === 'negativeDirection' && < ChevronDown size={18} color='red' />}
                                {activeTrade.priceDirection === 'positiveDirection' && <ChevronUp size={18} color='green' />}
                            </div>
                        </div>


                        {showTradeOptions ?
                            <div className='TradeOptionControl'>
                                <button onClick={() => setShowTradeOptions(false)} className='iconButton'> <X color='white' size={16} /></button>

                                <input type="number" placeholder='Sell Price' ref={liquidatePrice} autoComplete='off' />
                                <button onClick={() => liquidateFullPosition()} className='iconButton'>
                                    <p>All</p><CopySlash color='red' size={16} />
                                </button>


                            </div>
                            : <div className='TimeFrameOptions'>
                                <div className='flex' onClick={() => setShowMiniGraph(true)}>
                                    {/* <p >Today</p> */}
                                    <p ><span className={activeTrade?.todaysGain > 0 ? 'positiveDirection' : 'negativeDirection'}>${(activeTrade.mostRecentPrice - activeTrade.previousClose).toFixed(2)}</span></p>
                                    <p className={activeTrade?.todaysGain > 0 ? 'positiveDirection' : 'negativeDirection'}>{((activeTrade.mostRecentPrice - activeTrade.previousClose) / activeTrade.previousClose * 100).toFixed(2)}%</p>
                                </div>
                                <p onClick={() => handleStockToFourWaySector()} onContextMenu={(e) => { e.preventDefault(); handleStockToFourWay() }}>{activeTrade.sector}</p>
                                {/* <button onClick={() => handleStockToFourWay()} className='iconButton'><Expand color='white' size={16} /></button> */}
                            </div>
                        }
                    </div>

                    <div>
                        {showStopEnterExit === 0 ?
                            <div className={activeTrade.percentFromOpen >= 0 ? 'activeTradePositive currentPL' : 'activeTradeNegative currentPL'} onClick={() => setShowStopEnterExit(1)}>
                                <div onMouseEnter={() => setShowGainPercentOrGPP(1)} onMouseLeave={() => setShowGainPercentOrGPP(0)}>
                                    <h2>{activeTrade.percentFromOpen > 0 && '+'}{activeTrade.percentFromOpen.toFixed(2)}%</h2>
                                    <p>GPS: ${activeTrade.gainPerShare.toFixed(2)}</p>
                                </div>

                                <div onMouseEnter={() => setShowGainPercentOrGPP(2)} onMouseLeave={() => setShowGainPercentOrGPP(0)}>
                                    <h2>${(activeTrade.gainPerShare * activeTrade.availableShares).toFixed(2)}</h2>
                                    <p >Day's P/L: ${activeTrade?.todaysGain.toFixed(2)}</p>
                                </div>
                            </div> :
                            showStopEnterExit === 1 ? <div className={activeTrade.percentFromOpen >= 0 ? 'activeTradePositive PlanStopEnterExit' : 'activeTradeNegative PlanStopEnterExit'}
                                onClick={() => setShowStopEnterExit(2)}>
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
                                showStopEnterExit === 2 ? <div className={activeTrade.percentFromOpen >= 0 ? 'activeTradePositive PlanStopEnterExit' : 'activeTradeNegative PlanStopEnterExit'}
                                    onClick={() => setShowStopEnterExit(3)}>
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
                                    : <div className={activeTrade.percentFromOpen >= 0 ? 'activeTradePositive PlanStopEnterExit' : 'activeTradeNegative PlanStopEnterExit'}
                                        onClick={() => setShowStopEnterExit(0)}>
                                        <div>Risk</div>
                                        <p>{activeTrade.idealPercents[0]} vs {activeTrade.idealPercents[3]}</p>
                                        <div>Reward</div>
                                    </div>}

                        <div
                            className={activeTrade.percentFromOpen >= 0 ? 'moveCapturePositive MoveCaptured' : 'moveCaptureNegative MoveCaptured'}>
                            {showGainPercentOrGPP === 0 ?
                                <p onClick={() => setShowGainPercentOrGPP(1)} >{activeTrade.percentOfGain.toFixed(2)}% E/X Captured</p> :

                                showGainPercentOrGPP === 1 ?
                                    <div className='flex' onClick={() => setShowGainPercentOrGPP(2)}>
                                        <p>GPP ${(activeTrade.availableShares * 0.01).toFixed(2)}</p>
                                        <p>GPD ${(activeTrade.availableShares * 0.10).toFixed(2)}</p>
                                    </div> :
                                    <div onClick={() => setShowGainPercentOrGPP(0)}>
                                        <p>${(activeTrade.idealTotalGain - activeTrade.totalGain).toFixed(2)} From Exit Price</p>
                                    </div>
                            }
                        </div>

                    </div>

                    {showPositionInfo === 0 ?
                        <div className='TradeBlockBottom'>
                            <div onClick={() => setShowPositionInfo(1)}>
                                <p>Position Size</p>
                                <p>{activeTrade.availableShares}</p>
                            </div>
                            <div onClick={() => setShowPositionInfo(2)}>
                                <p>Market Value</p>
                                <p>${(activeTrade.availableShares * activeTrade.mostRecentPrice).toFixed(2)}</p>
                            </div>
                        </div> :
                        showPositionInfo === 1 ?
                            <div className='TradeBlockBottom' onClick={() => setShowPositionInfo(0)}>
                                <div >
                                    <p>ATR</p>
                                    <p>${activeTrade?.atrAtPurchase}</p>
                                </div>
                                <div>
                                    <p>Hold Days</p>
                                    <p>{differenceInBusinessDays(new Date(), activeTrade.enterDate)}/{activeTrade?.daysToCover}</p>
                                </div>
                            </div>
                            :
                            <div className='TradeBlockBottom' onClick={() => setShowPositionInfo(0)}>
                                <div>
                                    <p>Position Risk</p>
                                    <p>${activeTrade.idealTotalRisk.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p>Ideal Reward</p>
                                    <p>${activeTrade.idealTotalGain.toFixed(2)}</p>
                                </div>
                            </div>
                    }
                </div>


            </div>
        }    </>
    )
}

export default SingleActiveTradeBlock