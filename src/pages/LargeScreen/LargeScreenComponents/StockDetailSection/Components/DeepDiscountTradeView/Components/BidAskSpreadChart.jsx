import React from 'react'
import { usePopulateInitialDeepDiscountEngineQuery } from '../../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { activeTradeWithGraphSelectors } from '../../../../../../../features/Trades/TradeSliceApi'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'

function BidAskSpreadChart({ tickerSymbol, quotesHistory })
{

    return (
        <div>
            <h3>Past 5min Quotes</h3>
            <div className='hide-scrollbar' style={{ height: '200px', width: '400px', overflowY: 'scroll', fontSize: 'var(--fs-100)' }}>
                {quotesHistory.toReversed().map((t, i) =>
                {
                    if (i < 10) return <div className='flex' >
                        <p>{format(t.time, "HH:mm:ss")}</p>
                        <p>Bid: {t.BidPrice}</p>
                        <p>Ask: {t.AskPrice}</p>
                        <p>Spread: {t.spread}</p>
                    </div>
                })}
            </div>
        </div>
    )
}

export default BidAskSpreadChart