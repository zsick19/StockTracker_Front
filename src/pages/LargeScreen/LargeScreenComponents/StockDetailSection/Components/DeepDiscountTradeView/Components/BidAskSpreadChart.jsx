import React from 'react'
import { usePopulateInitialDeepDiscountEngineQuery } from '../../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { activeTradeWithGraphSelectors } from '../../../../../../../features/Trades/TradeSliceApi'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'

function BidAskSpreadChart({ tickerSymbol, quotesHistory })
{

    return (
        <div> Quotes:            {quotesHistory.length}
            <div style={{ height: '400px', width: '400px', overflowY: 'scroll' }}>
                {quotesHistory.map((t) => <div className='flex' >
                    <p>Spread: {t.spread}</p>
                    <p>Time: {format(t.time, "HH:mm:ss")}</p>
                </div>)}
            </div>
        </div>
    )
}

export default BidAskSpreadChart