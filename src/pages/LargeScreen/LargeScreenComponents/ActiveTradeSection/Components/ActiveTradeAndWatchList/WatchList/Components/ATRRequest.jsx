import React from 'react'
import { useGetStockAverageTrueRangeQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'

function ATRRequest({ ticker, changeFromYesterdayClose })
{
    const { data, isSuccess, isLoading } = useGetStockAverageTrueRangeQuery({ ticker })

    let atrContent = changeFromYesterdayClose.toFixed(2)
    if (isSuccess)
    {
        atrContent = `${changeFromYesterdayClose.toFixed(2)} v ${data.currentATR.toFixed(2)}`
    }

    return (
        <p>{atrContent}</p>
    )
}

export default ATRRequest