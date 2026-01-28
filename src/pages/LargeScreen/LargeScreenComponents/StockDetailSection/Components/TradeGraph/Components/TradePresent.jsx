import React, { useState } from 'react'
import { useAlterTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'

function TradePresent({ selectedStock })
{
    const [alterTradeRecord] = useAlterTradeRecordMutation()
    const [alterTradeDetails, setAlterTradeDetails] = useState({ tradePrice: undefined, positionSizeOfAlter: undefined })
    const [tradeServerResponse, setTradeServerResponse] = useState(undefined)

    async function attemptToAlterTradeRecord(action)
    {
        console.log(alterTradeDetails)
        if (!selectedStock?.trade._id) return
        try
        {
            if (action === 'partialSell' && (!alterTradeDetails?.tradePrice || !alterTradeDetails?.positionSizeOfAlter)) return
            if (action === 'additionalBuy' && (!alterTradeDetails?.tradePrice || !alterTradeDetails?.positionSizeOfAlter)) return
            if (action === 'closeAll' && !alterTradeDetails?.tradePrice) return

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
                setTradeServerResponse('tradeCompleted')
            } else
            {
                setTradeServerResponse('Recorded Successfully')
                setTimeout(() =>
                {
                    setTradeServerResponse(undefined)
                }, [2000])
            }
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }


    function handleAlterTradeDetailChanges(e)
    {
        setAlterTradeDetails(prev => ({ ...prev, [e.target.id]: parseFloat(e.target.value) }))
    }
    return (
        <div>
            current number of shares
            average price per share
            gain/loss

            <p>
                {selectedStock.trade.averagePurchasePrice}
                <p>
                    {selectedStock.trade.availableShares}
                </p>
            </p>
            {tradeServerResponse === 'tradeCompleted' ? <div> trading journal button </div> :
                <div className='flex'>
                    <div>
                        add to trade
                        <div>
                            <label htmlFor="additionalSharePurchase">Number of Shares</label>
                            <input type="number" id="additionalSharePurchase" min={1} />
                            <label htmlFor="additionalSharePrice">Price Per Share</label>
                            <input type="double" id='additionalSharePrice' />
                            <button onClick={() => attemptToAlterTradeRecord('additionalBuy')}>Add Shares</button>
                        </div>
                    </div>
                    <br />
                    <div>
                        sell trade options
                        <div>
                            <form onSubmit={(e) => e.preventDefault()} onChange={(e) => handleAlterTradeDetailChanges(e)}>
                                <label htmlFor="tradePrice">Price</label>
                                <input type="double" id='tradePrice' min={0} />
                                <label htmlFor="positionSizeOfAlter">Position Size</label>
                                <input type="number" min={1} id='positionSizeOfAlter' />
                                <button type='button' onClick={() => attemptToAlterTradeRecord('partialSell')}>Sell Partial</button>
                                <button type='button' onClick={() => attemptToAlterTradeRecord('closeAll')}>Close Position</button>
                            </form>
                            <p>{tradeServerResponse}</p>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default TradePresent