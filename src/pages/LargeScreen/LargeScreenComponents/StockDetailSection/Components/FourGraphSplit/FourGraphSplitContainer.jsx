import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllFourStocks, setSelectedStockAndTimelineFourSplit } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import FourWaySpitGraphContainer from './Components/FourWaySplitGraphContainer'
import './FourGraphSplit.css'


function FourGraphSplitContainer()
{
    const dispatch = useDispatch()
    const tickers = useSelector(selectAllFourStocks)
    useEffect(() => { if (tickers.length < 4) { dispatch(setSelectedStockAndTimelineFourSplit({ ticker: tickers[0].ticker })) } }, [])

    return (
        <div id='LSH-FourGraphSplit'>
            {tickers.map((tickerWithTimeFrame, index) => <FourWaySpitGraphContainer selectedStock={tickerWithTimeFrame} index={index} />)}
        </div>
    )
}

export default FourGraphSplitContainer