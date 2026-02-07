import React from 'react'
import { useSelector } from 'react-redux'
import { unchartedVisitedList } from '../../../../../../../features/SelectedStocks/PreviousNextStockSlice'

function UnChartedProgressDisplay()
{
    const unchartedList = useSelector(unchartedVisitedList)

    return (
        <div id='LHS-UnchartedProgressDisplay'>
            <p>List of uncharted progress</p>
            {unchartedList.map((uncharted) => <div className='flex'>
                <p>{uncharted.ticker}</p>
                <p>{uncharted.reviewed ? 'Seen' : 'Not Seen'}</p>
            </div>)}
        </div>
    )
}

export default UnChartedProgressDisplay