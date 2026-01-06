import React from 'react'
import { useGetUsersUnconfirmedPatternsQuery } from '../../../../../../features/MarketSearch/ConfirmationSliceApi'

function ConfirmMarketSearch()
{
    const { data, isSuccess } = useGetUsersUnconfirmedPatternsQuery()


    let confirmVisual
    if (isSuccess)
    {
        confirmVisual = data.map((ticker) => <div>{ticker}</div>)
    }
    return (
        <div>
            Confirm Market Search
            {confirmVisual}
        </div>
    )
}

export default ConfirmMarketSearch