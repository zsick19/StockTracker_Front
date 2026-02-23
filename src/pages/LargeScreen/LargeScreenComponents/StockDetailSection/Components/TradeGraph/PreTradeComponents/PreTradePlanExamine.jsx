import React from 'react'
import { useGetStockAverageTrueRangeQuery } from '../../../../../../../features/StockData/StockDataSliceApi'

function PreTradePlanExamine({ selectedStock })
{
    const { data, isLoading, isError, isSuccess, error, refetch } = useGetStockAverageTrueRangeQuery({ ticker: selectedStock?.tickerSymbol })

    let atrContent
    if (isSuccess)
    {
        atrContent = <div>
            <p>ATR Today: ${data.currentATR.toFixed(2)}</p>
            <p>ATR 13 Days Ago: ${data.firstATR.toFixed(2)}</p>

            <br />
            <p>{data.currentATR > data.firstATR ? 'ATR Increasing' : 'ATR Decreasing'}</p>
            <p>Days To Match Spread {((selectedStock.plan.exitPrice - selectedStock.plan.enterPrice) / data.currentATR).toFixed(2)}</p>

        </div>
    }


    return (
        <div id='PreTradePlanExamine'>
            <div>

                <div className='flex'>
                    <div>
                        <p>${selectedStock.plan.stopLossPrice}</p>
                        <p>Stoploss</p>
                        <p>{selectedStock.plan.percents[0]}%</p>
                    </div>
                    <div>
                        <p>${selectedStock.plan.enterPrice}</p>
                        <p>Enter</p>
                    </div>
                    <div>
                        <p>${selectedStock.plan.enterBufferPrice}</p>
                        <p>Enter Buffer</p>
                        <p>{selectedStock.plan.percents[1]}%</p>
                    </div>
                    <div>
                        <p>${selectedStock.plan.exitBufferPrice}</p>
                        <p>Exit Buffer</p>
                        <p>{selectedStock.plan.percents[2]}%</p>
                    </div>
                    <div>
                        <p>${selectedStock.plan.exitPrice}</p>
                        <p>Exit</p>
                        <p>{selectedStock.plan.percents[3]}%</p>
                    </div>
                    <div>
                        <p>${selectedStock.plan.moonPrice}</p>
                        <p>Moon</p>
                        <p>{selectedStock.plan.percents[4]}%</p>
                    </div>
                </div>

                <br />
                <div>
                    <p>Risk vs Reward {selectedStock.plan.percents[0].toFixed(2)}% vs {selectedStock.plan.percents[3].toFixed(2)}% </p>
                </div>
            </div>


            {atrContent}



        </div>
    )
}

export default PreTradePlanExamine