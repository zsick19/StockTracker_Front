import React, { useMemo, useState } from 'react'
import { useGetUsersTradingJournalQuery } from '../../../../../../../features/Trades/TradingJournalApiSlice'
import TradeStats from './TradeStats'
import SingleSelectedTrade from './SingleSelectedTrade'

function PreviousTradeJournal({ tradeFilter })
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersTradingJournalQuery()
    console.log(data)
    const [tradeSort, setTradeSort] = useState({ sort: undefined, direction: undefined })
    const [selectedTrade, setSelectedTrade] = useState(undefined)
    const [showSelectedTradeOrStats, setShowSelectedTradeOrStats] = useState(false)

    const filterSortedTradeHistory = useMemo(() =>
    {
        if (!data || !data?.length) return []

        let tempForReturn = data
        if (tradeFilter.tickerSearch) tempForReturn = data.filter(t => t.tickerSymbol === tradeFilter.tickerSearch)


        switch (tradeSort.sort)
        {
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
                        <p>Date Enter/Exit</p>
                        <p>Percentage Gain</p>

                        <p>Enter Price</p>
                        <p>Exit Price</p>
                        <p>Move Captured</p>
                        <p>Total Monies</p>
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