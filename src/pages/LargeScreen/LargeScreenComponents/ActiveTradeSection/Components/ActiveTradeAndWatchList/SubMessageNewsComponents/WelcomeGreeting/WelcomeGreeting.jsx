import React, { useState } from 'react'
import { useRefreshStreamTickersMutation } from '../../../../../../../../features/auth/authApiSlice'
import { Check } from 'lucide-react'
import PositionListDailyMoves from '../../../../../StockDetailSection/Components/ActiveTradeWatchMany/Components/PositionListDailyMoves'
import './WelcomeGreeting.css'
import { useGetActiveTradeNewsQuery } from '../../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import { StockCsvUpload } from './StockCsvUpload'
import { TerminalTaskStatusTickerHUD } from '../../../../../../../../layouts/dash/TerminalTaskStatusTickerHUD'
import MorningCheckList from './DailyCheckListContainer'
import TaskCheckOffContainer from './TaskCheckOffContainer'

function WelcomeGreeting()
{
    // const { data, isSuccess } = useGetActiveTradeNewsQuery(undefined)


    const [uploadProcess, setUploadProcess] = useState('DAILY CSV')
    return (
        <div id='welcomeGreeting'>
            <TaskCheckOffContainer />
            <TerminalTaskStatusTickerHUD />
            <StockCsvUpload process={uploadProcess} />
            <div>
                <button style={{ backgroundColor: "#00FFFF" }} onClick={() => setUploadProcess('DAILY CSV')}>Daily CSV</button>
                <button style={{ backgroundColor: "purple" }} onClick={() => setUploadProcess('CORE EM')}>Core EM</button>
                <button style={{ backgroundColor: "#00ff55" }} onClick={() => setUploadProcess('ZONE DOC')}>Zone Doc</button>
            </div>

            {/* <PositionListDailyMoves /> */}
        </div>
    )
}

export default WelcomeGreeting