import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function SingleNewsRunner({ newsRunner })
{
    const dispatch = useDispatch()
    const hasPriceChange = newsRunner.mostRecentCandle.ClosePrice !== newsRunner.newsAlertOriginalPrice


    const statusClass = (newsRunner.status === 'LARGEVOLUME' || newsRunner.status === 'EXPLODING') ? 'newRunnerExploding' :
        newsRunner.status === 'PROGRESSING' ? 'newsRunnerProgressing' :
            (newsRunner.percentChangeFromOriginal > 1 || newsRunner.status === 'ACTIVE') ? 'newsRunnerMovement' : ''


    return (
        <div className={`singleNewsRunnerAlert ${statusClass}`} style={{ opacity: `${newsRunner?.impact_score ? 1 : statusClass !== '' ? 1 : 0.25}` }}
            onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 30, ticker: newsRunner.id }))}>
            <p>{newsRunner.ticker}</p>
            <p>{newsRunner.newsAlertOriginalPrice.toFixed(3)}</p>
            <p>{newsRunner.mostRecentCandle.ClosePrice.toFixed(3)}</p>
            <p>{hasPriceChange ? newsRunner.percentChangeFromOriginal.toFixed(2) : '-'}%</p>
        </div>
    )
}

export default SingleNewsRunner