import React, { useMemo, useRef, useState } from 'react'
import { activeTradeSelectors, useAlterTradeRecordMutation, useGetUsersActiveTradesQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import { setSelectedStockAndTimelineFourSplit, setSelectedStockAndTimelineFourSplitWithSector, setSingleChartTickerTimeFrameAndChartingId, setSingleChartTickerTimeFrameChartIdPlanIdForTrade, setSingleChartToTickerTimeFrameTradeId } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { ChevronDown, ChevronUp, CopySlash, Expand, X } from 'lucide-react'
import VerticalPlanDiagram from './VerticalPlanDiagram'
import VerticalMoveDiagram from './VerticalMoveDiagram'
import { differenceInBusinessDays, isToday } from 'date-fns'
import { selectMacroTickersAndChartIds } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import MiniGraphChartWrapper from './MiniGraphChartWrapper'
import { sectorToTicker } from '../../../../../../../Utilities/SectorsAndIndustries'
import CashOutMessage from './CashOutMessage'
import MiniFiveMinChart from '../../../../StockDetailSection/Components/TinyPreWatch/Components/MiniFiveMinChart'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { initiateTickerPreCheck } from '../../../../../../../features/Trades/PreTradeCheckSlice'
import { provideEnterExitPlanSelector } from '../../../../../../../Utilities/adaptorSelection'
import { selectDetailedScoreBreakDownBySymbol, selectPlanForStaticDetails, selectStaticTradeBlockInfoByTicker } from '../../../../../../../features/Engine/EnginePlanApiSlice'
import MiniCandleLineChart from './MiniCandleLineChart'
import { getInsertionIndexLinear } from '../../../../../../../Utilities/UtilityHelperFunctions'

function SingleActiveTradeBlock({ activeTrade })
{
    const tickerSymbol = activeTrade.tickerSymbol

    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const activeTradeStaticPlanFields = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);


    const selectStaticTradeBlock = useMemo(selectStaticTradeBlockInfoByTicker, [])
    const activeStaticTradeInfo = useSelector((state) => selectStaticTradeBlock(state, tickerSymbol), shallowEqual)


    const dispatch = useDispatch()

    const { centralScoreProfile, mostRecentPrice, mostRecentPriceUpDown } = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, tickerSymbol))






    const [showStopEnterExit, setShowStopEnterExit] = useState(0)
    const [showPositionInfo, setShowPositionInfo] = useState(0)
    const [showGainPercentOrGPP, setShowGainPercentOrGPP] = useState(0)
    const [showTradeOptions, setShowTradeOptions] = useState(false)
    const [showMiniGraph, setShowMiniGraph] = useState(false)




    function handleStockToFourWay()
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: activeTrade.tickerSymbol, chartId: activeTrade._id, trade: activeTrade }))
    }
    function handleStockToFourWaySector()
    {
        let sectorTicker = sectorToTicker[activeTrade.sector]
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplitWithSector({ ticker: activeTrade.tickerSymbol, chartId: activeTrade._id, sectorChartId: macroToChartId[sectorTicker], tickerSector: activeTrade.sector, sectorTickerSymbol: sectorTicker, trade: activeTrade }))
    }
    function handleStockToTradeChart()
    {
        dispatch(setSingleChartToTickerTimeFrameTradeId({ tickerSymbol: activeTrade.tickerSymbol, chartId: activeTrade._id, planId: activeTrade._id, trade: activeTrade }))
        dispatch(setStockDetailState(8))
    }
    function handleFinalPreCheckView()
    {
        dispatch(initiateTickerPreCheck({ ticker: activeTrade.tickerSymbol, tickerSector: activeTrade.sector, chartId: activeTrade._id, planId: activeTrade._id, plan: plan, activeTrade: activeTrade }))
        dispatch(setStockDetailState(20))
    }


    const isPositiveOrNegativeTrade = mostRecentPrice >= activeTrade.averagePurchasePrice
    const averagePriceToExitSpan = activeStaticTradeInfo.planPricePoints[4] - activeTrade.averagePurchasePrice
    const currentChangeFromAveragePrice = mostRecentPrice - activeTrade.averagePurchasePrice

    const averagePriceRiskPercent = (activeTrade.averagePurchasePrice - activeStaticTradeInfo.planPricePoints[0]) * 100 / activeTrade.averagePurchasePrice
    const averagePriceRewardPercent = (activeStaticTradeInfo.planPricePoints[4] - activeTrade.averagePurchasePrice) * 100 / activeTrade.averagePurchasePrice

    const averageGainPerShare = mostRecentPrice - activeTrade.averagePurchasePrice


    const todayOpenPrice = isToday(activeTrade.snapShot.DailyBar.Timestamp) ? activeTrade.snapShot.DailyBar.OpenPrice : 0
    const yesterdayClosePrice = isToday(activeTrade.snapShot.DailyBar.Timestamp) ? activeTrade.snapShot.PrevDailyBar.ClosePrice : activeTrade.snapShot.DailyBar.ClosePrice

    let todayPL = 0
    if (todayOpenPrice) todayPL = (mostRecentPrice - todayOpenPrice) * activeTrade.availableShares
    let todayPercent = ((mostRecentPrice - todayOpenPrice) / todayOpenPrice)

    let totalCost = 0
    activeTrade.purchaseRecords.forEach(t => totalCost += (t.purchasePrice * t.sharesRemaining))

    let openPL = 0
    activeTrade.purchaseRecords.forEach(t => openPL += ((mostRecentPrice - t.purchasePrice) * t.sharesRemaining))
    let percentPLTotal = ((openPL - totalCost) / totalCost)


    let idealTotalGain = (activeStaticTradeInfo.planPricePoints[4] - activeTrade.averagePurchasePrice) * activeTrade.availableShares
    let idealTotalRisk = (activeTrade.averagePurchasePrice - activeStaticTradeInfo.planPricePoints[0]) * activeTrade.availableShares


const classVisualNames=['belowStopLoss','belowEnter','belowEnterBuffer','belowExitBuffer','belowExit','belowMoon','aboveMoon']


    const currentVisualPosition = getInsertionIndexLinear(activeStaticTradeInfo.planPricePoints, mostRecentPrice)

    return (<>
        {/* {false ?
            // {activeTrade.totalGain < -50 ?
            <CashOutMessage activeTrade={activeTrade} liquidateFullPosition={liquidateFullPosition} /> : */}

        {/* {showMiniGraph ? <MiniGraphChartWrapper setShowMiniGraph={setShowMiniGraph} activeTrade={activeTrade} /> : */}
        
        <div className={`LSH-ActiveTradeBlock  ${classVisualNames[currentVisualPosition]} `}>
            <div className='VerticalPlanDiagrams'>
                <VerticalPlanDiagram idealPrices={activeStaticTradeInfo.planPricePoints} averageEntryPrice={activeTrade.averagePurchasePrice}
                    currentPrice={mostRecentPrice} tickerSymbol={tickerSymbol}
                    emaPricePoints={[activeStaticTradeInfo.emaPricePoints.ema9, activeStaticTradeInfo.emaPricePoints.ema50, activeStaticTradeInfo.emaPricePoints.ema200]}
                    atrPricePoints={[yesterdayClosePrice - activeStaticTradeInfo.atr, yesterdayClosePrice, yesterdayClosePrice + activeStaticTradeInfo.atr]}
                    upwardVolumeNodes={activeStaticTradeInfo.volumeProfile.overHeadResistance}
                    downwardVolumeNodes={activeStaticTradeInfo.volumeProfile.underlyingSupport}
                />


                {/* <VerticalMoveDiagram currentPrice={activeTrade.mostRecentPrice} percentOfGain={activeTrade.percentOfGain} /> */}
            </div>

            <div className='TradeInfoSection'>
                <div>
                    <div className='PriceTickerInfo'>
                        <h2 onClick={() => { setShowTradeOptions(prev => !prev); }}>{tickerSymbol}</h2>
                        <div className='PriceMovementPerTrade' onClick={() => handleStockToTradeChart()}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); handleFinalPreCheckView() }}>
                            <h2 style={{ color: `${mostRecentPrice > activeStaticTradeInfo.TodayOpenPrice ? 'green' : mostRecentPrice < activeStaticTradeInfo.TodayOpenPrice ? 'red' : 'gray'}` }}                            >
                                ${mostRecentPrice.toFixed(mostRecentPrice > 2 ? 2 : 3)}</h2>
                            {mostRecentPriceUpDown ? < ChevronDown size={18} color='red' /> : <ChevronUp size={18} color='green' />}
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
                                <p ><span className={activeTrade?.todaysGain > 0 ? 'positiveDirection' : 'negativeDirection'}>
                                    ${(mostRecentPrice - activeStaticTradeInfo.PrevClosePrice).toFixed(2)}</span></p>

                                <p className={activeTrade?.todaysGain > 0 ? 'positiveDirection' : 'negativeDirection'}>
                                    {((mostRecentPrice - activeStaticTradeInfo.PrevClosePrice) / activeStaticTradeInfo.PrevClosePrice * 100).toFixed(2)}%</p>
                            </div>
                            <p onClick={() => handleStockToFourWaySector()} onContextMenu={(e) => { e.preventDefault(); handleStockToFourWay() }}>
                                {activeStaticTradeInfo.sector}</p>
                        </div>
                    }
                </div>

                <div>
                    {showStopEnterExit === 0 ?
                        <div
                            style={{ backgroundColor: `${isPositiveOrNegativeTrade ? 'green' : 'red'}` }}
                            className='currentPL' onClick={() => setShowStopEnterExit(1)}>

                            <div onMouseEnter={() => setShowGainPercentOrGPP(1)} onMouseLeave={() => setShowGainPercentOrGPP(0)}>
                                <h2>{isPositiveOrNegativeTrade && '+'}{percentPLTotal.toFixed(2)}%</h2>
                                <p>GPS: ${averageGainPerShare.toFixed(2)}</p>
                            </div>

                            <div onMouseEnter={() => setShowGainPercentOrGPP(2)} onMouseLeave={() => setShowGainPercentOrGPP(0)}>
                                <h2>${(averageGainPerShare * activeTrade.availableShares).toFixed(2)}</h2>
                                <p >Day's P/L: <span style={{ color: `${todayPL >= 0 ? '' : 'red'}` }}>${todayPL.toFixed(2)}</span></p>
                            </div>
                        </div> :
                        showStopEnterExit === 1 ?
                            <div style={{ backgroundColor: `${isPositiveOrNegativeTrade ? 'green' : 'red'}` }}
                                className='PlanStopEnterExit'
                                onClick={() => setShowStopEnterExit(2)}>
                                <div>
                                    <p>${activeStaticTradeInfo.planPricePoints[0]}</p>
                                    <p>StopLoss</p>
                                </div>
                                <div>
                                    <p>${activeStaticTradeInfo.planPricePoints[1]}</p>
                                    <p>Enter</p>
                                </div>
                                <div>
                                    <p>${activeStaticTradeInfo.planPricePoints[2]}</p>
                                    <p>Enter Buffer</p>
                                </div>
                            </div> :
                            showStopEnterExit === 2 ?
                                <div style={{ backgroundColor: `${isPositiveOrNegativeTrade ? 'green' : 'red'}` }}
                                    className='PlanStopEnterExit' onClick={() => setShowStopEnterExit(3)}>
                                    <div>
                                        <p>${activeStaticTradeInfo.planPricePoints[3]}</p>
                                        <p>Exit Buffer</p>
                                    </div>
                                    <div>
                                        <p>${activeStaticTradeInfo.planPricePoints[4]}</p>
                                        <p>Exit</p>
                                    </div>
                                    <div>
                                        <p>${activeStaticTradeInfo.planPricePoints[5]}</p>
                                        <p>Moon Shot</p>
                                    </div>
                                </div>
                                :
                                <div style={{ backgroundColor: `${isPositiveOrNegativeTrade ? 'green' : 'red'}` }}
                                    className='PlanStopEnterExit'
                                    onClick={() => setShowStopEnterExit(0)}>
                                    <div>Risk</div>
                                    <p>{averagePriceRiskPercent.toFixed(1)} vs {averagePriceRewardPercent.toFixed(1)}</p>
                                    <div>Reward</div>
                                </div>}

                    <div style={{ border: `2px solid ${isPositiveOrNegativeTrade ? 'green' : 'red'}` }} className='MoveCaptured'>
                        {showGainPercentOrGPP === 0 ?
                            <p onClick={() => setShowGainPercentOrGPP(1)} >
                                {(currentChangeFromAveragePrice * 100 / averagePriceToExitSpan).toFixed(2)}% E/X Captured
                            </p> :

                            showGainPercentOrGPP === 1 ?
                                <div className='flex' onClick={() => setShowGainPercentOrGPP(2)}>
                                    <p>GPP ${(activeTrade.availableShares * 0.01).toFixed(2)}</p>
                                    <p>GPD ${(activeTrade.availableShares * 0.10).toFixed(2)}</p>
                                </div> :
                                <div onClick={() => setShowGainPercentOrGPP(0)}>
                                    <p>${(idealTotalGain - openPL).toFixed(2)} From Exit Price</p>
                                </div>
                        }
                    </div>

                </div>

                {showPositionInfo === 0 ?
                    <div className='TradeBlockBottom'>
                        <div onClick={() => setShowPositionInfo(1)}>
                            <p>ATR</p>
                            <p>${(mostRecentPrice - activeStaticTradeInfo.PrevClosePrice).toFixed(2)} vs ${activeStaticTradeInfo?.atr}</p>
                        </div>
                        <div onClick={() => setShowPositionInfo(2)}>
                            <MiniCandleLineChart tickerSymbol={tickerSymbol}
                                direction={mostRecentPrice > activeStaticTradeInfo.TodayOpenPrice} openPrice={activeStaticTradeInfo.TodayOpenPrice}
                                stopLossPrice={activeStaticTradeInfo.planPricePoints[0]} />
                        </div>
                    </div> :
                    showPositionInfo === 1 ?
                        <div className='TradeBlockBottom' onClick={() => setShowPositionInfo(0)}>
                            <div >
                                <p>Position Size</p>
                                <p>{activeTrade.availableShares}</p>
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
                                <p>${idealTotalRisk.toFixed(2)}</p>
                            </div>
                            <div>
                                <p>Ideal Reward</p>
                                <p>${idealTotalGain.toFixed(2)}</p>
                            </div>
                        </div>
                }
            </div>
        </div>
    </>
    )
}

export default SingleActiveTradeBlock