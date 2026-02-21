import React, { useEffect, useMemo, useState } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import ChartGraph from '../../../../../../../components/ChartSubGraph/ChartGraph'
import { abbreviateNumber, marketCapToText } from '../../../../../../../Utilities/UtilityHelperFunctions'
import * as short from 'short-uuid'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../../../../../../features/Charting/GraphHoverZoomElement'

function SingleUnconfirmedResultBlock({ ticker, keepTheseTickers, setKeepTheseTickers })
{
    const dispatch = useDispatch()
    const uuid = useMemo(() => short.generate(), [])

    const [showKeepOrRemove, setShowKeepOrRemove] = useState(false)
    const [confirmed, setConfirmed] = useState(keepTheseTickers.keepInfo.find(t => t.ticker === ticker) ? 1 : keepTheseTickers.remove.includes(ticker) ? 2 : 0)

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.dailyOneYear, liveFeed: false, info: true })
    let graphContent
    let tickerInfoContent = <div className='StockInfoBlock'><p>{ticker}</p></div>

    useEffect(() =>
    {
        dispatch(setInitialGraphControl({ uuid }))
        return (() => { if (uuid) dispatch(clearGraphControl({ uuid })) })
    }, [])


    if (isSuccess)
    {
        let stockInfo = data.tickerInfo

        graphContent = <div className={`ChartGraphWrapper `}>
            <ChartGraph ticker={{ ticker: ticker }} showEMAs={true} isInteractive={false} isLivePrice={false} isZoomAble={true}
                candleData={data.candleData} timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} />
        </div>

        tickerInfoContent = <div className='StockInfoBlock'>
            <p>{stockInfo.Symbol}</p>
            <p>{stockInfo.CompanyName}</p>
            <p>{stockInfo.Sector}</p>
            <p>{marketCapToText(stockInfo.MarketCap)}</p>
            <p className={stockInfo.AvgVolume > 300000 ? 'MarketSearchHighVol' : 'MarketSearchLowVol'}>{abbreviateNumber(stockInfo.AvgVolume)}</p>
        </div>

    } else if (isLoading) { graphContent = <GraphLoadingSpinner /> }
    else if (isError) { graphContent = <GraphLoadingError refetch={refetch} /> }

    useEffect(() =>
    {
        setConfirmed(keepTheseTickers.keepInfo.find(t => t.ticker === ticker) ? 1 : keepTheseTickers.remove.includes(ticker) ? 2 : 0)
    }, [data])


    function handleConfirmingTicker(e)
    {
        e.stopPropagation();
        if (confirmed === 0)
        {
            setKeepTheseTickers(prev => ({
                keepInfo: [...prev.keepInfo, { ticker: ticker, sector: data.tickerInfo.Sector }],
                remove: prev.remove.filter(t => t !== ticker),
                total: prev.total + 1
            }));
        } else
        {
            setKeepTheseTickers(prev => ({
                keepInfo: [...prev.keepInfo, { ticker: ticker, sector: data.tickerInfo.Sector }],
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
                keepInfo: prev.keepInfo.filter(t => t.ticker !== ticker),
                remove: [...prev.remove, ticker],
                total: prev.total + 1
            }))
        } else
        {
            setKeepTheseTickers(prev => ({
                keepInfo: prev.keepInfo.filter(t => t.ticker !== ticker),
                remove: [...prev.remove, ticker],
                total: prev.total
            }))
        }
        setConfirmed(2)
        setShowKeepOrRemove(false)
    }



    return (
        <div className={`UnconfirmedPatternBlock ${confirmed === 1 ? "keepConfirmed" : confirmed === 2 ? 'removeConfirmed' : ""}`} onClick={(e) => { e.stopPropagation(); setShowKeepOrRemove(true) }}>
            {(showKeepOrRemove && confirmed === 0) ?
                <div className='UnconfirmedKeepRemoveDialog'>
                    <button onClick={(e) => handleRemovingTicker(e)}>Remove</button>
                    <button onClick={(e) => handleConfirmingTicker(e)}>Confirm</button>
                </div> :
                (showKeepOrRemove && confirmed === 1) ?
                    <div className='UnconfirmedKeepRemoveDialog'>
                        <button onClick={(e) => handleRemovingTicker(e)}>Remove</button>
                    </div> :
                    (showKeepOrRemove && confirmed === 2) &&
                    <div className='UnconfirmedKeepRemoveDialog'>
                        <button onClick={(e) => handleConfirmingTicker(e)}>Confirm</button>
                    </div>}
            {graphContent}
            {tickerInfoContent}
        </div>
    )
}

export default SingleUnconfirmedResultBlock