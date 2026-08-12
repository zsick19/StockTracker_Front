import React from 'react'
import { useSelector } from 'react-redux'
import { selectAllNewsRunnerIds, selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import SingleNewsRunner from '../../../../MacroControlSection/Components/NewsRunner/Components/SingleNewsRunner'
import { useClearNewsRunnerDataMutation } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'

function CurrentRunnersList({ tickerForStream, setTickerForStream })
{

    const newsRunners = useSelector((state) => selectAllNewsRunnerIds(state))
    if (!newsRunners || newsRunners.length === 0) return <div>No Runners</div>
    const currentNewsRunner = useSelector((state) => selectNewsRunnerById(state, tickerForStream))


    const [clearNewsRunnerData] = useClearNewsRunnerDataMutation()
    async function attemptClearingNewsRunner(params)
    {
        try
        {
            const results = await clearNewsRunnerData({ tickerSymbol: tickerForStream }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    const hasPriceChange = currentNewsRunner?.mostRecentTradePrice !== currentNewsRunner?.newsAlertOriginalPrice

    return (
        <div id='CurrentRunnersList'>
            <div id='CurrentRunnerInfo' style={{ backgroundColor: `${currentNewsRunner.foundEntrySurge ? 'red' : ''}` }}>
                <p>{currentNewsRunner.id}</p>
                <p>{currentNewsRunner.newsAlertOriginalPrice}</p>
                <p>{currentNewsRunner.mostRecentTradePrice}</p>
                <p>{hasPriceChange ? currentNewsRunner.percentChangeFromOriginal.toFixed(2) : ''}%</p>
                <p>Impact: {currentNewsRunner?.impact_score || '-'}</p>

                <button onClick={() => attemptClearingNewsRunner()}>Clear</button>
            </div>
            <div id='RunnersList' className='hide-scrollbar'>
                {newsRunners.map((t, i) => <SingleNewsRunner key={`weGotRunner${t}`} tickerSymbol={t} />)}
            </div>
        </div>
    )
}

export default CurrentRunnersList