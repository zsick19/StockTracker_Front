import React from 'react'
import { useSelector } from 'react-redux'
import { selectNewsRunnerPriceChangeById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'

function PriceAndChangeReadOut({ ticker })
{
    const priceChange = useSelector((state) => selectNewsRunnerPriceChangeById(state, ticker))

    return (
        <div>
            <div className='flex'>
                <p>Current: ${priceChange.mostRecentPrice}</p>
                <p>{priceChange.originalPrice !== priceChange.mostRecentPrice ? priceChange.percent.toFixed(2) + '%' : '-'}</p>
            </div>
            <p>Original Price: ${priceChange.originalPrice}</p>
        </div>
    )
}

export default PriceAndChangeReadOut