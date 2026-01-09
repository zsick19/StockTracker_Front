import React from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'

function SingleGraphChartWrapper({ ticker, timeFrame })
{

    const { data } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame, info: true })
    console.log(data)



    return (
        <div id='LHS-SingleGraphForChartingWrapper'>
            d
        </div>
    )
}

export default SingleGraphChartWrapper