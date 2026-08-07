import React, { useState } from 'react'
import { useRefreshStreamTickersMutation } from '../../../../../../../../features/auth/authApiSlice'
import { ArrowLeftRight, Check, X } from 'lucide-react'
import PositionListDailyMoves from '../../../../../StockDetailSection/Components/ActiveTradeWatchMany/Components/PositionListDailyMoves'
import './WelcomeGreeting.css'
import { useGetActiveTradeNewsQuery } from '../../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import { StockCsvUpload } from './StockCsvUpload'
import { TerminalTaskStatusTickerHUD } from '../../../../../../../../layouts/dash/TerminalTaskStatusTickerHUD'
import MorningCheckList from './DailyCheckListContainer'
import TaskCheckOffContainer from './TaskCheckOffContainer'
import { useUpdateStockKeyLevelsMutation } from '../../../../../../../../features/KeyLevels/KeyLevelSliceApi'
import DailySPYValues from './DailySPYValues'

function DailyValueFileUploads()
{
    const [uploadProcess, setUploadProcess] = useState('DAILY CSV')
    const [currentInputForm, setCurrentInputForm] = useState(0)

    function provideCurrentInput()
    {
        switch (currentInputForm)
        {
            case 0: return <DailySPYValues showManualSpyIntake={false} />
            case 1: return <DailySPYValues showManualSpyIntake={true} />
            case 2: return <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', justifyItems: 'center', height: '230px' }}>
                <StockCsvUpload process={'DAILY CSV'} />
                <StockCsvUpload process={'DAILY EM'} />
                <StockCsvUpload process={'ASHER EM'} />
                <StockCsvUpload process={'ZONE DOC'} />
            </div>
            case 3: return <div> Spy Classification build out here</div>
        }
    }

    return (
        <div id='welcomeGreeting'>
            <div id='DailyInputsAndControls'>
                <div id='DailyInputSelectionButtons'>
                    <div>PreMarket</div>
                    <button onClick={() => setCurrentInputForm(0)}>Daily SPY Input</button>
                    <button onClick={() => setCurrentInputForm(1)}>Manual SPY Input</button>
                    <button onClick={() => setCurrentInputForm(2)}>File Uploads</button>
                    <br />
                    <div>Post Market</div>
                    <button onClick={() => setCurrentInputForm(3)}>SPY Classification</button>
                </div>
                {provideCurrentInput()}
            </div>
        </div>
    )
}

export default DailyValueFileUploads