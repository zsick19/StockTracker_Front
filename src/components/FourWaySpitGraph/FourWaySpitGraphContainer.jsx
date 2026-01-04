import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedIndexTimeFrame } from '../../features/SelectedStocks/SelectedStockSlice'
import { defaultTimeFrames } from '../../Utilities/TimeFrames'
import { useGetStockDataUsingTimeFrameQuery } from '../../features/StockData/StockDataSliceApi'
import GraphLoadingError from '../ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'

function FourWaySpitGraphContainer({ selectedStock, index })
{
    const dispatch = useDispatch()
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: selectedStock.ticker, timeFrame: selectedStock.timeFrame })

    const handleTimeFrameChange = () => { dispatch(setSelectedIndexTimeFrame({ index: index, timeFrame: defaultTimeFrames.weeklyOneYear })) }


    let graphVisual
    if (isSuccess && data.candleData.length > 0)
    {
        graphVisual = <div>a candle chart Graph goes here</div>
    } else if (isSuccess)
    {
        graphVisual = <div>No data to display for this ticker</div>
    } else if (isLoading) graphVisual = <GraphLoadingSpinner />
    else if (isError)
    {
        graphVisual = <GraphLoadingError />
    }



    return (
        <div>
            <h1>
                {selectedStock.ticker}
            </h1>
            <button onClick={() => handleTimeFrameChange()}>{selectedStock.timeFrame.duration}{selectedStock.timeFrame.unitOfDuration}</button>
            {graphVisual}
        </div>
    )
}

export default FourWaySpitGraphContainer