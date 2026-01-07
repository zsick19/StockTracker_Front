import React, { useState } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
function SingleUnconfirmedResultBlock({ ticker, keepTheseTickers, setKeepTheseTickers })
{
    const [showKeepOrRemove, setShowKeepOrRemove] = useState(false)
    const [confirmed, setConfirmed] = useState(keepTheseTickers.keep.includes(ticker) ? 1 : keepTheseTickers.remove.includes(ticker) ? 2 : 0)

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.dailyOneYear, lifeFeed: false, info: true })

    let graphContent
    let tickerInfoContent = <div>{ticker}</div>

    if (isSuccess)
    {
        let stockInfo = data.tickerInfo
        graphContent = <div className={`ChartGraphWrapper ${confirmed === 1 ? "keepConfirmed" : confirmed === 2 ? 'removeConfirmed' : ''}`}>
            Graph goes here
        </div>
        tickerInfoContent = <div className='StockInfoBlock'>
            <p>{stockInfo.Symbol}</p>
            <p>{stockInfo.CompanyName}</p>
            <p>{stockInfo.MarketCap}</p>
            <p>{stockInfo.AvgVolume}</p>
        </div>
    } else if (isLoading) { graphContent = <GraphLoadingSpinner /> }
    else if (isError) { graphContent = <GraphLoadingError refetch={refetch} /> }

    function handleConfirmingTicker(e)
    {
        e.stopPropagation();
        if (confirmed === 0)
        {
            setKeepTheseTickers(prev => ({
                keep: [...prev.keep, ticker],
                remove: prev.remove.filter(t => t !== ticker),
                total: prev.total + 1
            }));
        } else
        {
            setKeepTheseTickers(prev => ({
                keep: [...prev.keep, ticker],
                remove: prev.remove.filter(t => t !== ticker),
                total: prev.total
            }));
        }
        setConfirmed(1);
        setShowKeepOrRemove(false)
    }

    function handleRemovingTicker(e)
    {
        e.stopPropagation()
        if (confirmed === 0)
        {
            setKeepTheseTickers(prev => ({
                keep: prev.keep.filter(t => t !== ticker),
                remove: [...prev.remove, ticker],
                total: prev.total + 1
            }))
        } else
        {
            setKeepTheseTickers(prev => ({
                keep: prev.keep.filter(t => t !== ticker),
                remove: [...prev.remove, ticker],
                total: prev.total
            }))
        }
        setConfirmed(2)
        setShowKeepOrRemove(false)
    }



    return (
        <div className='UnconfirmedPatternBlock ' onClick={() => setShowKeepOrRemove(true)}>
            {(showKeepOrRemove && confirmed === 0) ?
                <div className='UnconfirmedKeepRemoveDialog'>
                    <button onClick={(e) => handleRemovingTicker(e)}>Remove</button>
                    <button onClick={(e) => handleConfirmingTicker(e)}>Confirm</button>
                </div> :
                (showKeepOrRemove && confirmed === 1) ? <div className='UnconfirmedKeepRemoveDialog'>
                    <button onClick={(e) => handleRemovingTicker(e)}>Remove</button>
                </div> :
                    (showKeepOrRemove && confirmed === 2) &&
                    <div className='UnconfirmedKeepRemoveDialog'>
                        <button onClick={(e) => handleConfirmingTicker(e)}>Confirm</button>
                    </div>}
            {graphContent}
            <div>
                {tickerInfoContent}
            </div>
        </div>
    )
}

export default SingleUnconfirmedResultBlock