import React from 'react'
import MacroWatchList from './MacroWatchList'

function MacroWatchListContainer()
{
    const watchLists = [{ title: 'ddd', tickers: ['AAA', 'BBB', 'CCC'] },
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
            {watchLists.map((watch) => <MacroWatchList watchList={watch} />)}
        </div>
    )
}

export default MacroWatchListContainer