import React, { useEffect, useState } from 'react'
import { useGetTinyEnterExit5MinChartsQuery, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SingleTinyPreWatch from './Components/SingleTinyPreWatch'
import './TinyPreWatch.css'
// import MacroTinyPreWatch from './Components/MacroTinyPrewatch'
import { isWeekend } from 'date-fns'
import { RotateCcw } from 'lucide-react'
import ExpandedPreWatch from './Components/ExpandedPreWatch'
import PreWatchContainer from './Components/PreWatchContainer'

function TinyPreWatch()
{
    let isWeekendPollingInterval = isWeekend(new Date()) ? 300000 : 0
    const { data, isSuccess, isLoading, isError, error } = useGetTinyEnterExit5MinChartsQuery(undefined, { pollingInterval: isWeekendPollingInterval })
    const { data: enterExitData, isSuccess: isEnterExitSuccess, refetch } = useGetUsersEnterExitPlanQuery()

    const [selectedTickerIndex, setSelectedTickerIndex] = useState(-1)
    const [watchListSelection, setWatchListSelection] = useState('enterBufferHit')
    const [watchListIds, setWatchListsIds] = useState([])

    let tinyPreWatchContent
    if (isSuccess) { tinyPreWatchContent = <PreWatchContainer preWatchIds={watchListIds} watchListSelection={watchListSelection} setSelectedTickerIndex={setSelectedTickerIndex} /> }
    else if (isLoading) { tinyPreWatchContent = <div>Loading</div> }
    else if (isError) { tinyPreWatchContent = <div>Error</div> }



    useEffect(() =>
    {
        if (isEnterExitSuccess && isSuccess)
        {
            setWatchListsIds(enterExitData[watchListSelection].ids)
            setSelectedTickerIndex(0)
        } else
        {
            setWatchListsIds([])
            setSelectedTickerIndex(-1)
        }

    }, [watchListSelection, isEnterExitSuccess, isSuccess])

    function handleWatchListChange()
    {
        if (watchListSelection === 'enterBufferHit') setWatchListSelection('stopLossHit')
        if (watchListSelection === 'stopLossHit') setWatchListSelection('enterBufferHit')
    }
    function handlePlanNav(direction)
    {
        if (!direction && selectedTickerIndex > 0) { setSelectedTickerIndex(prev => prev - 1) }
        else if (direction && selectedTickerIndex + 1 < watchListIds.length) { setSelectedTickerIndex(prev => prev + 1) }
    }
    return (
        <div id='LHS-TinyPreWatch'>
            <div id='LHS-TinyPreAsList'>
                <div className='LHS-TinyListHeader'>
                    <p onClick={handleWatchListChange}>{watchListSelection === 'enterBufferHit' ? 'Enter Buffer' : 'Stop Loss'}</p>
                    <button onClick={refetch}>R</button>
                    <button onClick={() => handlePlanNav(false)}>Prev</button>
                    <button onClick={() => handlePlanNav(true)}>Next</button>
                </div>
                <div id='LHS-TinySinglePreWatchContainer' className='hide-scrollbar'>
                    {tinyPreWatchContent}
                </div>
            </div>
            {(selectedTickerIndex >= 0 && isSuccess) ?
                <ExpandedPreWatch id={watchListIds[selectedTickerIndex]} watchList={watchListSelection} />
                :
                <div>
                    <p>Error fetching plans</p>
                </div>
            }
        </div>
    )
}

export default TinyPreWatch