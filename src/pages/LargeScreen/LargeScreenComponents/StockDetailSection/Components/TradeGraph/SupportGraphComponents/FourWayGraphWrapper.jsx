import React from 'react'

function FourWayGraphWrapper({ selectedStock })
{

    const supportingTickers = [selectedStock.tickerSymbol, 'SSS', 'EEE', 'QWW']



    //function ChartWithChartingWrapper({ ticker, candleData, setChartInfoDisplay, interactionController, chartId, timeFrame, setTimeFrame, uuid, lastCandleData, candlesToKeepSinceLastQuery, showEMAs })
    return (
        <div id='TradeSupportingTickersSplit'>
            {supportingTickers.map((supporting) => <div>{supporting}</div>)}
        </div>
    )
}

export default FourWayGraphWrapper