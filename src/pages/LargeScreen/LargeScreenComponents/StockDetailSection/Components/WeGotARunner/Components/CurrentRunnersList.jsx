import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { markNewsRunnerActive, selectAllNewsRunnerIds, selectAllNewsRunnersAndSort, selectNewsRunnerById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import SingleNewsRunner from '../../../../MacroControlSection/Components/NewsRunner/Components/SingleNewsRunner'
import { useClearNewsRunnerDataMutation } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import SkyRocketCheck from './SkyRocketCheck'
import AllNewsRunnerSmallDisplay from './AllNewsRunnerSmallDisplay'
import { differenceInSeconds } from 'date-fns'

function CurrentRunnersList({ tickerForStream, setTickerForStream })
{
    const dispatch = useDispatch()
    const currentNewsRunner = useSelector((state) => selectNewsRunnerById(state, tickerForStream))
    const [timeSinceRelease, setTimeSinceRelease] = useState()


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
    useEffect(() =>
    {
        // Safety check in case the timestamp isn't loaded yet
        if (!currentNewsRunner.article_published_at && !currentNewsRunner.dispatched_at_ms) return;


        const intervalId = setInterval(() =>
        {
            let time = currentNewsRunner?.article_published_at || currentNewsRunner.dispatched_at_ms
            let difference = 120 - differenceInSeconds(new Date(), time)
            console.log(difference)
            setTimeSinceRelease(difference)
        }, 10000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [currentNewsRunner]);


    const hasPriceChange = currentNewsRunner?.mostRecentTrade.Price !== currentNewsRunner?.newsAlertOriginalPrice

    return (
        <div id='CurrentRunnersList'>
            <div id='CurrentRunnerInfo' style={{ backgroundColor: `${currentNewsRunner.foundEntrySurge ? 'red' : ''}` }}>
                <div className='flex'>
                    <p>{currentNewsRunner.id} </p>
                    <p>${currentNewsRunner.mostRecentTrade.Price}</p>
                    <p>{currentNewsRunner.percentChangeFromOriginal.toFixed(2)}%</p>
                </div>
                <br />
                <div style={{ fontSize: 'var(--fs-100)' }}>

                    <p>${currentNewsRunner.newsAlertOriginalPrice}</p>
                    <p>Impact Score: {currentNewsRunner?.impact_score || '-'}</p>
                    <br />
                    <p>Volume Status: {currentNewsRunner.status}</p>
                    <p>Large Order Size: {currentNewsRunner.largeOrderThreshold}</p>
                </div>

                <button onClick={() => attemptClearingNewsRunner()}>Clear</button>
                <button onClick={() => dispatch(markNewsRunnerActive({ Symbol: tickerForStream }))}>Mark Active
                    {currentNewsRunner.status === 'INITIALIZING' ? timeSinceRelease : ''}</button>
                {currentNewsRunner.stockInfo && <SkyRocketCheck stockInfo={currentNewsRunner.stockInfo} />}
            </div>

            <AllNewsRunnerSmallDisplay />
        </div>
    )
}

export default CurrentRunnersList