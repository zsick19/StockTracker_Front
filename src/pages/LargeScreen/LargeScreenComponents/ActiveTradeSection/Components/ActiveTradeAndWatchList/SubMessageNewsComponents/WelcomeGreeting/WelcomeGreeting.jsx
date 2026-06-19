import React, { useState } from 'react'
import { useRefreshStreamTickersMutation } from '../../../../../../../../features/auth/authApiSlice'
import { Check } from 'lucide-react'
import PositionListDailyMoves from '../../../../../StockDetailSection/Components/ActiveTradeWatchMany/Components/PositionListDailyMoves'
import './WelcomeGreeting.css'
import { useGetActiveTradeNewsQuery } from '../../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import { StockCsvUpload } from './StockCsvUpload'
import ExpectedMovesCoreUpload from './ExpectedMoveUpload'

function WelcomeGreeting()
{
    const { data, isSuccess } = useGetActiveTradeNewsQuery(undefined)

    const [refreshStreamTickers] = useRefreshStreamTickersMutation()
    const [showRefreshDelivered, setShowRefreshDelivered] = useState(false)
    async function attemptStreamTickerRefresh()
    {
        try
        {
            await refreshStreamTickers().unwrap()
            setShowRefreshDelivered(true)

            setTimeout(() => { setShowRefreshDelivered(false) }, [2000])
        } catch (error)
        {
            console.log(error)
        }
    }



    return (
        <div id='welcomeGreeting'>
            <div>
                <h1>Welcome!</h1>
                <p>Refresh Backend Stream</p>
                {showRefreshDelivered ? <p>Stream Refreshed <Check color="green" /></p> : <button onClick={() => attemptStreamTickerRefresh()}>Refresh Stream</button>}
                <button onClick={() => window.location.reload()}>Refresh Page</button>
            </div>
            <StockCsvUpload />
            <ExpectedMoveUpload Process={'Core Daily EM'} />
            <ExpectedMoveUpload Process={'Zone Doc'} />

            <PositionListDailyMoves />

        </div>
    )
}

export default WelcomeGreeting