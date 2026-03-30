import React from 'react'
import { useGetWatchListFiveMinChartsQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import SingleMacroTinyPreWatch from './SingleMacroTinyPreWatch'
import { isWeekend } from 'date-fns'

function MacroTinyTickerContainer({ selectedMacroTickerIds })
{
    let isWeekendPollingInterval = isWeekend(new Date()) ? 300000 : 0
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetWatchListFiveMinChartsQuery({ tickers: selectedMacroTickerIds, minIncrement: 5 }, { pollingInterval: isWeekendPollingInterval })

    let macroTinyContent
    if (isSuccess) { macroTinyContent = data.map((candles) => <SingleMacroTinyPreWatch candleData={candles} tickerId={candles[0].Symbol} />) }
    else if (isLoading) { macroTinyContent = <div>Loading...</div> }
    else if (isError) { macroTinyContent = <div>Error</div> }

    return (
        <div id='MacroTinyTickerContainer' className='hide-scrollbar'>
            <div className='hide-scrollbar'>
                {macroTinyContent}
            </div>
        </div>
    )
}

export default MacroTinyTickerContainer