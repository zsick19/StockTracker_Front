import React from 'react'
import { useAlterTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'

function TradePresent({ selectedStock })
{
    const [alterTradeRecord] = useAlterTradeRecordMutation()


    async function attemptToAlterTradeRecord(action)
    {
        if (!selectedStock?.tradeId) return
        try
        {
            const results = await alterTradeRecord({ action })
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }


    return (
        <div>
            trade present and display trade stats here once configured
            current number of shares
            average price per share
            gain/loss

            <p>
                {selectedStock.trade.averagePurchasePrice}
            </p>
            <div className='flex'>
                <div>
                    add to trade
                    <div>
                        <label htmlFor="additionalSharePurchase">Number of Shares</label>
                        <input type="number" id="additionalSharePurchase" min={1} />
                        <label htmlFor="additionalSharePrice">Price Per Share</label>
                        <input type="double" id='additionalSharePrice' />
                        <button onClick={attemptToAlterTradeRecord('additionalBuy')}>Add Shares</button>
                    </div>
                </div>
                <br />
                <div>
                    sell trade options
                    <div>
                        <input type="number" min={1} />
                        <button onClick={attemptToAlterTradeRecord('partialSell')}>Sell Partial</button>
                    </div>
                    <button onClick={attemptToAlterTradeRecord('closeAll')}>Close Position</button>
                </div>
            </div>
        </div>
    )
}

export default TradePresent