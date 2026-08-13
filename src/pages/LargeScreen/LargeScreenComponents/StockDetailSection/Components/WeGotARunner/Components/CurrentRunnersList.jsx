import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { markNewsRunnerActive, selectAllNewsRunnerIds, selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import SingleNewsRunner from '../../../../MacroControlSection/Components/NewsRunner/Components/SingleNewsRunner'
import { useClearNewsRunnerDataMutation } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import SkyRocketCheck from './SkyRocketCheck'

function CurrentRunnersList({ tickerForStream, setTickerForStream })
{
    const dispatch = useDispatch()
    const newsRunners = useSelector((state) => selectAllNewsRunnerIds(state))
    const currentNewsRunner = useSelector((state) => selectNewsRunnerById(state, tickerForStream))


    console.log(currentNewsRunner.stockInfo)
    console.log(currentNewsRunner.mostRecentTrade)


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
    const hasPriceChange = currentNewsRunner?.mostRecentTrade.Price !== currentNewsRunner?.newsAlertOriginalPrice

    return (
        <div id='CurrentRunnersList'>
            <div id='CurrentRunnerInfo' style={{ backgroundColor: `${currentNewsRunner.foundEntrySurge ? 'red' : ''}` }}>
                <p>{currentNewsRunner.id}</p>
                <p>${currentNewsRunner.newsAlertOriginalPrice} vs ${currentNewsRunner.mostRecentTrade.Price}</p>
                <p>{hasPriceChange ? currentNewsRunner.percentChangeFromOriginal.toFixed(2) + '%' : ''}</p>
                <p>Impact: {currentNewsRunner?.impact_score || '-'}</p>

                <button onClick={() => attemptClearingNewsRunner()}>Clear</button>
                <button onClick={() => dispatch(markNewsRunnerActive({ Symbol: tickerForStream }))}>Mark Active</button>
                {currentNewsRunner.stockInfo && <SkyRocketCheck stockInfo={currentNewsRunner.stockInfo} />}
            </div>
            <div id='RunnersList' className='hide-scrollbar'>
                {newsRunners.map((t, i) => <SingleNewsRunner key={`weGotRunner${t}`} tickerSymbol={t} />)}
            </div>
        </div>
    )
}

export default CurrentRunnersList