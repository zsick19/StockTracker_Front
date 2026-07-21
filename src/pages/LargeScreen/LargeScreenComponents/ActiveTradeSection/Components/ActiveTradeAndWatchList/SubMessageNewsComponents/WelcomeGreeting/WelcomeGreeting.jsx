import React, { useState } from 'react'
import { useRefreshStreamTickersMutation } from '../../../../../../../../features/auth/authApiSlice'
import { Check } from 'lucide-react'
import PositionListDailyMoves from '../../../../../StockDetailSection/Components/ActiveTradeWatchMany/Components/PositionListDailyMoves'
import './WelcomeGreeting.css'
import { useGetActiveTradeNewsQuery } from '../../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import { StockCsvUpload } from './StockCsvUpload'
import ExpectedMoveUpload from './ExpectedMoveUpload'
import { TerminalTaskStatusTickerHUD } from '../../../../../../../../layouts/dash/TerminalTaskStatusTickerHUD'
import MorningCheckList from './DailyCheckListContainer'
import TaskCheckOffContainer from './TaskCheckOffContainer'

function WelcomeGreeting()
{
    // const { data, isSuccess } = useGetActiveTradeNewsQuery(undefined)



    return (
        <div id='welcomeGreeting'>
            <TaskCheckOffContainer />
            <TerminalTaskStatusTickerHUD />
            <StockCsvUpload />
            {/* <div>
                <ExpectedMoveUpload Process={'Core Daily EM'} />
                <br />
                <ExpectedMoveUpload Process={'Zone Doc'} />
            </div> */}
            {/* <PositionListDailyMoves /> */}
        </div>
    )
}

export default WelcomeGreeting