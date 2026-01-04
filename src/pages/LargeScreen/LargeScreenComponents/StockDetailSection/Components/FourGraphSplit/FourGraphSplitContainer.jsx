import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAllFourStocks } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import FourWaySpitGraphContainer from '../../../../../../components/FourWaySpitGraph/FourWaySpitGraphContainer'
import './FourGraphSplit.css'


function FourGraphSplitContainer()
{
    const tickers = useSelector(selectAllFourStocks)

    return (
        <div id='LSH-FourGraphSplit'>
            {tickers.map((tickerWithTimeFrame, index) => <FourWaySpitGraphContainer selectedStock={tickerWithTimeFrame} index={index} />)}
        </div>
    )
}

export default FourGraphSplitContainer