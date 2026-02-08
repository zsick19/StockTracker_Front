import React from 'react'
import { useGetUsersActiveTradesQuery } from '../../../../../../../../features/Trades/TradeSliceApi'
import SingleActiveTradeBlock from './SingleActiveTradeBlock'

function ActiveTradeBlockWrapper({ ids })
{
    return (
        <div id='LSH-ActiveTradeBlockWrapper' className='hide-scrollbar'>
            {ids.map((activeTradeId) => <SingleActiveTradeBlock id={activeTradeId} key={`activeTrade${activeTradeId}`} />)}
        </div>
    )
}

export default ActiveTradeBlockWrapper