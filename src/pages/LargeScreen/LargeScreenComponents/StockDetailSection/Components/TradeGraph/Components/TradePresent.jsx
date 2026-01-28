import React, { useState } from 'react'
import { useAlterTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import TradeSuccessCompleted from './TradeSuccessCompleted'

function TradePresent({ selectedStock })
{
    const [alterTradeRecord] = useAlterTradeRecordMutation()
    const [alterTradeDetails, setAlterTradeDetails] = useState({ tradePrice: selectedStock.trade.mostRecentPrice, positionSizeOfAlter: undefined })
    const [alterTradeErrorMessage, setAlterTradeErrorMessage] = useState(undefined)
    const [tradeServerResponse, setTradeServerResponse] = useState({ status: undefined, trade: undefined })

    async function attemptToAlterTradeRecord(action)
    {
        if (!selectedStock?.trade._id) return
        if (!alterTradeDetails.tradePrice) return setAlterTradeErrorMessage('Missing Trade Price')
        if ((action === 'partialSell' || action === 'additionalBuy') && !alterTradeDetails?.positionSizeOfAlter) return setAlterTradeErrorMessage('Missing Position Size')

        try
        {
            let results
            if (action === 'closeAll')
            {
                results = await alterTradeRecord({ action, tickerSymbol: selectedStock.tickerSymbol, tradeId: selectedStock.trade._id, tradePrice: alterTradeDetails.tradePrice, positionSizeOfAlter: selectedStock.trade.availableShares })
            } else
            {
                results = await alterTradeRecord({ action, tickerSymbol: selectedStock.tickerSymbol, tradeId: selectedStock.trade._id, ...alterTradeDetails })
            }

            if (results.data.tradeComplete)
            {
                setTradeServerResponse({ status: 'tradeCompleted', tradeResult: results.data })
            } else
            {
                setTradeServerResponse({ status: 'Recorded Successfully', tradeResult: results.data })
                setTimeout(() => { setTradeServerResponse(undefined) }, [2000])
            }

        } catch (error)
        {
            console.log(error)
        }
    }


    function handleAlterTradeDetailChanges(e)
    {
        setAlterTradeDetails(prev => ({ ...prev, [e.target.id]: parseFloat(e.target.value) }))
        setAlterTradeErrorMessage(undefined)
    }


    let gainPerShare = alterTradeDetails.tradePrice - selectedStock.trade.averagePurchasePrice
    let PL = gainPerShare * selectedStock.trade.availableShares
    return (
        <>
            {
                tradeServerResponse.status === 'tradeCompleted' ?
                    <TradeSuccessCompleted completedTrade={tradeServerResponse.trade} /> :
                    <div id='TradeDetailAndBuySellOptions'>


                        <div className='TradeOptions'>
                            <form onSubmit={(e) => e.preventDefault()} onChange={(e) => handleAlterTradeDetailChanges(e)}>
                                <div className='flex'>
                                    <div>
                                        <label htmlFor="tradePrice">Price</label>
                                        <input type="double" id='tradePrice' min={0} value={alterTradeDetails.tradePrice} />
                                    </div>
                                    <div>
                                        <label htmlFor="positionSizeOfAlter">Position Size</label>
                                        <input type="number" min={1} id='positionSizeOfAlter' value={alterTradeDetails.positionSizeOfAlter} />
                                    </div>
                                </div>
                                <div className='flex'>
                                    <button type='button' onClick={() => attemptToAlterTradeRecord('additionalBuy')}>Buy Shares</button>
                                    <button type='button' onClick={() => attemptToAlterTradeRecord('partialSell')}>Sell Shares</button>
                                </div>
                            </form>
                            <p>{alterTradeErrorMessage}</p>
                            <p>{tradeServerResponse.status}</p>
                        </div>

                        <div className='flex'>
                            <div>
                                <p>Avg Purchase Price: {selectedStock.trade.averagePurchasePrice}</p>
                                <p>Shares Available: {selectedStock.trade.availableShares}</p>
                            </div>
                        </div>
                        <div>
                            <p>Gain Per Share: ${gainPerShare.toFixed(2)}</p>
                            <p>P/L: ${PL.toFixed(2)}</p>
                            <br />
                            <form onSubmit={(e) => e.preventDefault()} onChange={(e) => handleAlterTradeDetailChanges(e)} >
                                <div>
                                    <label htmlFor="tradePrice">Close Out Price </label>
                                    <input type="double" id='tradePrice' min={0} value={alterTradeDetails.tradePrice} />
                                </div>
                                <button type='button' onClick={() => attemptToAlterTradeRecord('closeAll')}>Close Position</button>
                            </form>
                        </div>
                    </div>
            }
        </>
    )
}

export default TradePresent