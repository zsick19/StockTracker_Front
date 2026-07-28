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

function WelcomeGreeting()
{
    const [uploadProcess, setUploadProcess] = useState('DAILY CSV')
    const [currentInputForm, setCurrentInputForm] = useState(0)

    function provideCurrentInput()
    {
        switch (currentInputForm)
        {
            case 0: return <DailySPYValues showManualSpyIntake={false} />
            case 1: return <DailySPYValues showManualSpyIntake={true} />
            case 2: return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', justifyItems: 'center', height: '230px' }}>
                <StockCsvUpload process={uploadProcess} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
                    <button style={{ backgroundColor: "#00FFFF" }} onClick={() => setUploadProcess('DAILY CSV')}>Daily CSV</button>
                    <button style={{ backgroundColor: "purple" }} onClick={() => setUploadProcess('ASHER EM')}>Asher Core EM</button>
                    <button style={{ backgroundColor: "gold" }} onClick={() => setUploadProcess('DAILY EM')}>Daily EM</button>
                    <button style={{ backgroundColor: "#00ff55" }} onClick={() => setUploadProcess('ZONE DOC')}>Zone Doc</button>
                </div>
            </div>
            case 3: return <div> Spy Classification build out here</div>
        }
    }

    return (
        <div id='welcomeGreeting'>
            <TaskCheckOffContainer />
            <div id='DailyInputsAndControls'>
                <div id='DailyInputSelectionButtons'>
                    <div>PreMarket</div>
                    <button onClick={() => setCurrentInputForm(0)}>Daily SPY Input</button>
                    <button onClick={() => setCurrentInputForm(1)}>Manual SPY Input</button>
                    <button onClick={() => setCurrentInputForm(2)}>Expected Moves</button>
                    <br />
                    <div>Post Market</div>
                    <button onClick={() => setCurrentInputForm(3)}>SPY Classification</button>
                </div>
                {provideCurrentInput()}
            </div>
        </div>
    )
}

export default WelcomeGreeting