import React from 'react'
import { useGetUsersTradingJournalQuery } from '../../../../../../features/Trades/TradingJournalApiSlice'

function TradingJournal()
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersTradingJournalQuery()
    console.log(data)

    let tradeContent

    





    return (
        <div>TradingJournal</div>
    )
}

export default TradingJournal