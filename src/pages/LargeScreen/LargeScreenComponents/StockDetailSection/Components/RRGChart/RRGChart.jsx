import React, { useState } from 'react'
import { useGetAllMacroStocksDataQuery } from '../../../../../../features/StockData/StockDataSliceApi'
import { allSectorTickers } from '../../../../../../Utilities/SectorsAndIndustries'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'
import RRGChartContainer from './Components/RRGChartContainer'
import './RRGChartStyles.css'

function RRGChart()
{
    const [tailLength, setTailLength] = useState(7)
    const { data, isSuccess, isLoading, isError, error } = useGetAllMacroStocksDataQuery({ tickers: allSectorTickers, timeFrame: defaultTimeFrames.dailyHalfYear, compareTicker: 'SPY' })

    let graphContent
    if (isSuccess)
    {
        graphContent = <RRGChartContainer candleData={data} tailLength={tailLength} />
    }

    return (
        <div id='RRGChartPage'>
            <div id='ChartAndControlsContainer'>
                {graphContent}
                <div>
                    cntrols
                </div>
            </div>
            <div>
                charts
            </div>
        </div>
    )
}

export default RRGChart