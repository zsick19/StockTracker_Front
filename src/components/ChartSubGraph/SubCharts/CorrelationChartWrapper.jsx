import React from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../features/StockData/StockDataSliceApi'
import CorrelationChartResult from './CorrelationChartResult'

function CorrelationChartWrapper({ ticker1Data, ticker2, uuid, setDisplayTickerInput, timeFrame })
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({
        ticker: ticker2, timeFrame, liveFeed: false, info: false, provideNews: false
    })

    let fetchResult = (<>
        <div className='subChartWithVerticalTitle'>
            <p onClick={() => setDisplayTickerInput(prev => !prev)}>Correlation</p>
            <svg className='subChartYAxis'></svg>
        </div>
        <div className='subChartXAxis' >
            <svg ></svg>
        </div>
    </>)

    if (isSuccess)
    {
        fetchResult = <CorrelationChartResult ticker1Data={ticker1Data} ticker2Data={data.candleData} uuid={uuid} timeFrame={timeFrame} setDisplayTickerInput={setDisplayTickerInput} />
    } else if (isLoading)
    {
        fetchResult = (<><div className='subChartWithVerticalTitle'>
            <p onClick={() => setDisplayTickerInput(prev => !prev)}>Correlation</p>
            <svg className='subChartYAxis'></svg>
        </div>
            <div className='subChartXAxis' >
                <p>Loading</p>
            </div>
        </>)
    } else if (isError)
    {
        fetchResult = (<><div className='subChartWithVerticalTitle'>
            <p onClick={() => setDisplayTickerInput(prev => !prev)}>Correlation</p>
            <svg className='subChartYAxis'></svg>
        </div>
            <div className='subChartXAxis' >
                <p>Error Fetching Second Ticker Data</p>
            </div>
        </>)
    }

    return (
        <>
            {fetchResult}
        </>
    )
}

export default CorrelationChartWrapper