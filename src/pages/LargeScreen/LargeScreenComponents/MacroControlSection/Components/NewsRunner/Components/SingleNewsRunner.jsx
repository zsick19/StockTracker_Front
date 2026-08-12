import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function SingleNewsRunner({ tickerSymbol })
{
    const dispatch = useDispatch()
    const newsRunner = useSelector((state) => selectNewsRunnerById(state, tickerSymbol))
    // console.log(newsRunner)

    const hasPriceChange = newsRunner.mostRecentTrade.Price !== newsRunner.newsAlertOriginalPrice

    return (

        <div className={`singleNewsRunnerAlert ${newsRunner.percentChangeFromOriginal > 1 ? 'flashingHighAlertMoving' : ''}`} onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 30, ticker: tickerSymbol }))}>
            <p>{newsRunner.ticker}</p>
            <p>{newsRunner.newsAlertOriginalPrice.toFixed(3)}</p>
            <p>{hasPriceChange ? newsRunner.mostRecentTrade.Price.toFixed(3) : '-'}</p>
            <p>{hasPriceChange ? newsRunner.percentChangeFromOriginal.toFixed(2) : '-'}%</p>
        </div>
    )
}

export default SingleNewsRunner