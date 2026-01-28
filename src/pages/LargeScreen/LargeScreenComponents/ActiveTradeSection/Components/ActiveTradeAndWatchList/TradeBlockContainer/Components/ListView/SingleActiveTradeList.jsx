import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameChartIdPlanIdForTrade, setSingleChartToTickerTimeFrameTradeId } from '../../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { activeTradeSelectors, useAlterTradeRecordMutation, useGetUsersActiveTradesQuery } from '../../../../../../../../../features/Trades/TradeSliceApi'
import { ChevronDown, ChevronUp, Expand, Goal, PlaneLanding, X } from 'lucide-react'
import HorizontalPlanDiagram from '../../../WatchList/Components/PlanPricingDiagram/HorizontalPlanDiagram'

function SingleActiveTradeList({ id, setSelectedId })
{

    const dispatch = useDispatch()
    const [showStopEnterExit, setShowStopEnterExit] = useState(0)
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

    const [closeOutTradeDetails, setCloseOutTradeDetails] = useState(activeTrade.mostRecentPrice)
    const [alterTradeRecord] = useAlterTradeRecordMutation()

    async function attemptCloseOutOfPosition()
    {
        try
        {
            if (!activeTrade._id) return
            const results = await alterTradeRecord({ action: 'closeAll', tickerSymbol: id, tradeId: activeTrade._id, tradePrice: closeOutTradeDetails, positionSizeOfAlter: activeTrade.availableShares }).unwrap()

        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <div className={`LSH-SingleActiveTradeList ${activeTrade.classVisual}`}>
            <h2 onClick={() => { setShowTradeOptions(prev => !prev); }}>{id}</h2>

            <div className='ListPriceMovementPerTrade' onClick={() => handleStockToTradeChart()}>
                <p>${activeTrade.mostRecentPrice.toFixed(2)}</p>
                {activeTrade.priceDirection === 'negativeDirection' ? < ChevronDown size={18} color='red' /> : activeTrade.priceDirection === 'positiveDirection' ? <ChevronUp size={18} color='green' /> : <div className='spaceHolderSize18'></div>}
            </div>

            <div>
                <p className='dailyPercentage'>2.3%</p>
                <p className='dailyPercentage'>Day $22.3</p>
            </div>

            <div className='SingleActiveListPL' onClick={() => setShowStopEnterExit(1)}>
                <p>{activeTrade.percentFromOpen < 0 && '-'}${activeTrade.totalGain.toFixed(2)}</p>
                <p>Open {activeTrade.percentFromOpen < 0 && '-'}{activeTrade.percentFromOpen.toFixed(2)}%</p>
            </div>

            {showTradeOptions ?
                <form onSubmit={(e) => e.preventDefault()} className='closeOutForm'>
                    <input type="double" value={closeOutTradeDetails} onChange={(e) => setCloseOutTradeDetails(e.target.value)} />
                    <button onClick={() => attemptCloseOutOfPosition()}>Close Out</button>
                    <button className='iconButton' onClick={() => setShowTradeOptions(false)}><X color='white' /></button>
                </form>
                :
                <div className='DiagramPlanWrapper' onClick={() => setShowStopEnterExit(prev => !prev)}>
                    {showStopEnterExit ?
                        <div className='flex'>
                            <div>
                                <p>{activeTrade.percentFromPlanPrices[0].toFixed(2)}%</p>

                                <p>${activeTrade.tradingPlanPrices[0]}</p>
                            </div>
                            <div>
                                <p>{activeTrade.percentFromPlanPrices[1].toFixed(2)}%</p>
                                <p>${activeTrade.tradingPlanPrices[1]}</p>
                            </div>
                            <br />
                            <div>
                                <p>{activeTrade.percentFromPlanPrices[4].toFixed(2)}%</p>
                                <p>${activeTrade.tradingPlanPrices[4]}</p>
                            </div>
                        </div> :
                        <HorizontalPlanDiagram mostRecentPrice={activeTrade.mostRecentPrice} planPriceArray={activeTrade.tradingPlanPrices} />
                    }
                </div>
            }

            <div className='flex'>
                <button onClick={() => handleStockToFourWay()} className='iconButton' title='4Way'><Expand color='white' size={16} /></button>
                <button onClick={() => setShowTradeOptions(true)} className='iconButton' title='4Way'><PlaneLanding color='white' size={16} /></button>
                <button onClick={() => setSelectedId(id)} className='iconButton' title='Select'><Goal color='white' size={18} /></button>
            </div>
        </div>
    )
}

export default SingleActiveTradeList