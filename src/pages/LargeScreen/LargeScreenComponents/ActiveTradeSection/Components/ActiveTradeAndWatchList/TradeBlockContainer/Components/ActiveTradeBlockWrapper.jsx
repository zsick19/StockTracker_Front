import React from 'react'
import SingleActiveTradeBlock from './SingleActiveTradeBlock'

function ActiveTradeBlockWrapper({ ids, refetch })
{
    return (
        <div id='LSH-ActiveTradeBlockWrapper' className='hide-scrollbar' onDoubleClick={refetch}>
            {ids.map((activeTradeId) => <SingleActiveTradeBlock id={activeTradeId} key={`activeTrade${activeTradeId}`} />)}
        </div>
    )
}

export default ActiveTradeBlockWrapper