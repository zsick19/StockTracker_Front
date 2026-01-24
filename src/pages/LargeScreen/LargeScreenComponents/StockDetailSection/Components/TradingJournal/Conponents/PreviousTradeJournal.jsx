import React, { useMemo, useState } from 'react'
import { useGetUsersTradingJournalQuery } from '../../../../../../../features/Trades/TradingJournalApiSlice'
import TradeStats from './TradeStats'
import SingleSelectedTrade from './SingleSelectedTrade'
import { endOfMonth, isThisWeek, isToday, isYesterday, startOfMonth, startOfQuarter, startOfWeek, startOfYear, sub } from 'date-fns'

function PreviousTradeJournal({ tradeFilter })
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersTradingJournalQuery()

    const [tradeSort, setTradeSort] = useState({ sort: undefined, direction: undefined })
    const [selectedTrade, setSelectedTrade] = useState(undefined)
    const [showSelectedTradeOrStats, setShowSelectedTradeOrStats] = useState(false)


    const filterSortedTradeHistory = useMemo(() =>
    {
        if (!data || !data?.length) return []
        let tempForReturn = [...data]

        if (tradeFilter.tickerSearch) tempForReturn = data.filter(t => t.tickerSymbol === tradeFilter.tickerSearch)

        if (tradeFilter.tradeGains === 'positiveGains') tempForReturn = tempForReturn.filter(t => t?.exitPercentCapture > 0)
        else if (tradeFilter.tradeGains === 'negativeGains') tempForReturn = tempForReturn.filter(t => t?.exitPercentCapture < 0)

        switch (tradeFilter.closeDate)
        {
            case 'closedToday': tempForReturn = tempForReturn.filter(t => isToday(t?.exitDate)); break;
            case 'closedYesterday': tempForReturn = tempForReturn.filter(t => isYesterday(t?.exitDate)); break;
            case 'closedThisWeek': tempForReturn = tempForReturn.filter(t => isThisWeek(t?.exitDate)); break;
            case 'closedLastWeek': tempForReturn = tempForReturn.filter(t =>
            {
                let beginningOfLastWeek = sub(startOfWeek(new Date()), { days: 7 })
                if (new Date(t?.exitDate) > beginningOfLastWeek && new Date(t?.exitDate) < startOfWeek(new Date())) return t
            })
            case 'closedThisMonth': tempForReturn = tempForReturn.filter(t => new Date(t?.exitDate) > startOfMonth(new Date())); break;
            case 'closedLastMonth': tempForReturn = tempForReturn.filter(t => 
            {
                let oneMonthAgo = sub(new Date(), { months: 1 })
                let beginningOfLastMonth = startOfMonth(oneMonthAgo)
                let endOfLastMonth = endOfMonth(oneMonthAgo)
                if (new Date(t?.exitDate) > beginningOfLastMonth && new Date(t?.exitDate) < endOfLastMonth) return t
            }); break;
            case 'closedThisQuarter': tempForReturn = tempForReturn.filter(t => new Date(t?.exitDate) > startOfQuarter(new Date())); break;
            case 'closedThisYear': tempForReturn = tempForReturn.filter(t => new Date(t?.exitDate) > startOfYear(new Date())); break;
        }





        switch (tradeSort.sort)
        {
            case 'ticker': tempForReturn = tempForReturn.sort((a, b) => { return tradeSort.direction ? a.tickerSymbol.localeCompare(b.tickerSymbol) : b.tickerSymbol.localeCompare(a.tickerSymbol) }); break
            case 'totalMoney': break;
        }

        return tempForReturn
    }, [tradeFilter, tradeSort, data])

    let tradeStatContent
    let tradeHistoryContent
    if (isSuccess && !data.length)
    {
        tradeStatContent = <div>Can Not Supply Stats with No Trade Data</div>
        tradeHistoryContent = <div>No Current Trade History</div>
    }
    else if (isSuccess)
    {
        tradeStatContent = <TradeStats tradeData={data} setShowSelectedTradeOrStats={setShowSelectedTradeOrStats} />
        tradeHistoryContent = filterSortedTradeHistory.map((trade) => <SingleSelectedTrade key={trade.tickerSymbol} trade={trade} selectedTrade={selectedTrade} setSelectedTrade={setSelectedTrade} setShowSelectedTradeOrStats={setShowSelectedTradeOrStats} />)
    }
    else if (isLoading)
    {
        tradeStatContent = <div>Loading...</div>
        tradeHistoryContent = <div>Loading...</div>
    }
    else if (isError)
    {
        tradeStatContent = <div>Can Not Supply Stats with No Trade Data</div>
        tradeHistoryContent = <div>Error Fetching</div>
    }

    return (
        <div>
            <div id='TradeAndSelectedTradeContainer'>

                <div id='TradeFilterSortContainer'>
                    <div id='SortResultHeaders'>
                        <p onClick={() => setTradeSort(prev => ({ sort: 'ticker', direction: !prev.direction }))}>Ticker</p>
                        <p>Sector</p>
                        <p>Enter/Exit Date</p>
                        <p>Enter/Exit Price</p>
                        <p>R v R</p>
                        <p>Percentage Gain</p>
                        <p>% Of Move</p>
                        <p>Total Dollars</p>
                    </div>
                    <div id='TradeResults' className='hide-scrollbar'>
                        {tradeHistoryContent}
                    </div>
                </div>

                {showSelectedTradeOrStats ?
                    <div>
                        Selected Trade Details
                        <button onClick={() => setShowSelectedTradeOrStats(prev => !prev)}>View Trade Stats</button>
                    </div> :
                    tradeStatContent}

            </div>

        </div>
    )
}

export default PreviousTradeJournal