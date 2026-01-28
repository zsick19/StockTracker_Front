import React, { useState } from 'react'
import '../../TradeListStyles.css'
import SingleActiveTradeList from './SingleActiveTradeList'
import SelectedTradeListBlock from './SelectedTradeListBlock'

function ActiveTradeListWrapper({ ids })
{
    const [selectedId, setSelectedId] = useState([ids[0]])

    return (
        <div id='LSH-ActiveTradeListAndSingleBlockWrapper'>
            <div id='LSH-ActiveTradeList' className='hide-scrollbar'>
                {ids.map((activeTradeId) => <SingleActiveTradeList id={activeTradeId} setSelectedId={setSelectedId} />)}
            </div>
            <SelectedTradeListBlock id={selectedId} />
        </div >
    )
}

export default ActiveTradeListWrapper