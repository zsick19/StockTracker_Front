import React from 'react'
import { useGetStockAverageTrueRangeQuery } from '../../../../../../../features/StockData/StockDataSliceApi'

function PreTradePlanExamine({ selectedStock })
{
    const { data, isLoading, isError, isSuccess, error, refetch } = useGetStockAverageTrueRangeQuery({ ticker: selectedStock?.tickerSymbol })

    let atrContent
    if (isSuccess)
    {
        atrContent = <div>
            <p>ATR: ${data.currentATR.toFixed(2)}</p>
            <p>Days To Match Spread {((selectedStock.plan.exitPrice - selectedStock.plan.enterPrice) / data.currentATR).toFixed(2)}</p>
            <p>{data.currentATR > data.firstATR ? 'ATR Increasing' : 'ATR Decreasing'}</p>
        </div>
    }


    return (
        <div id='PreTradePlanExamine'>
            <div className='flex'>
                <div>
                    <p>{selectedStock.plan.percents[0]}%</p>
                    <p>Stoploss</p>
                    <p>${selectedStock.plan.stopLossPrice}</p>
                </div>
                <div>
                    <p>{selectedStock.plan.percents[1]}%</p>
                    <p>Enter</p>
                    <p>${selectedStock.plan.enterPrice}</p>
                </div>
                <div>
                    <p>Enter Buffer</p>
                    <p>${selectedStock.plan.enterBufferPrice}</p>
                </div>
                <div>
                    <p>{selectedStock.plan.percents[2]}%</p>
                    <p>Exit Buffer</p>
                    <p>${selectedStock.plan.exitBufferPrice}</p>
                </div>
                <div>
                    <p>{selectedStock.plan.percents[3]}%</p>
                    <p>Exit</p>
                    <p>${selectedStock.plan.exitPrice}</p>
                </div>
                <div>
                    <p>{selectedStock.plan.percents[4]}%</p>
                    <p>Moon</p>
                    <p>${selectedStock.plan.moonPrice}</p>
                </div>
            </div>


            <div>
                <p>RvR</p>
                <p>{selectedStock.plan.percents[0].toFixed(2)}% vs {selectedStock.plan.percents[3].toFixed(2)}% </p>
            </div>

            {atrContent}



        </div>
    )
}

export default PreTradePlanExamine