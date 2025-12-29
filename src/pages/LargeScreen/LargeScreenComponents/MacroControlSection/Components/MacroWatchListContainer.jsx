import React from 'react'
import MacroWatchList from './MacroWatchList'

function MacroWatchListContainer({ setPrimaryChartTicker })
{
    const watchLists = [{ title: 'ddd', tickers: ['AAAD', 'BBB', 'CCC'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    { title: 'CentralMacro', tickers: ['SPY', 'DIA'] },
    ]



    return (
        <div id='LSH-MacroWatchListContainer'>
            {watchLists.map((watch) => <MacroWatchList watchList={watch} setPrimaryChartTicker={setPrimaryChartTicker} />)}
        </div>
    )
}

export default MacroWatchListContainer