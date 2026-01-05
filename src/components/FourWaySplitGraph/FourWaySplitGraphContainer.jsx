import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedIndexTimeFrame } from '../../features/SelectedStocks/SelectedStockSlice'
import { defaultTimeFrames } from '../../Utilities/TimeFrames'
import { useGetStockDataUsingTimeFrameQuery } from '../../features/StockData/StockDataSliceApi'
import GraphLoadingError from '../ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import ChartWithChartingWrapper from '../ChartSubGraph/ChartWithChartingWrapper'
//import '../FourWaySplitGraph/FourWaySplitGraph.css'
import './FourWaySplitGraph.css'

function FourWaySpitGraphContainer({ selectedStock, index })
{
    const dispatch = useDispatch()
    const { data: stockData, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: selectedStock.ticker, timeFrame: selectedStock.timeFrame })

    const handleTimeFrameChange = () => { dispatch(setSelectedIndexTimeFrame({ index: index, timeFrame: defaultTimeFrames.weeklyOneYear })) }


    let graphVisual
    if (isSuccess && stockData.candleData.length > 0)
    {
        graphVisual = <ChartWithChartingWrapper ticker={selectedStock.ticker} candleData={stockData} chartId={selectedStock?._id} timeFrame={selectedStock.timeFrame} />

    } else if (isSuccess)
    {
        graphVisual = <div>No data to display for this ticker</div>
    } else if (isLoading) graphVisual = <GraphLoadingSpinner />
    else if (isError)
    {
        graphVisual = <GraphLoadingError />
    }



    return (
        <div className='LSH-FourWaySplitContainer'>
            <div className='flex'>
                <p>{selectedStock.ticker}</p><button onClick={() => handleTimeFrameChange()}>{selectedStock.timeFrame.duration}{selectedStock.timeFrame.unitOfDuration}</button>
            </div>
            {graphVisual}
        </div>
    )
}

export default FourWaySpitGraphContainer