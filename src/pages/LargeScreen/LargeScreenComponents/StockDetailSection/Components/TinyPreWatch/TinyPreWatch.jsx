import React, { useEffect, useState } from 'react'
import { useGetTinyEnterExit5MinChartsQuery, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SingleTinyPreWatch from './Components/SingleTinyPreWatch'
import './TinyPreWatch.css'
import MacroTinyPreWatch from './Components/MacroTinyPrewatch'
import { isWeekend } from 'date-fns'
import { RotateCcw } from 'lucide-react'

function TinyPreWatch()
{
    let isWeekendPollingInterval = isWeekend(new Date()) ? 300000 : 0
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetTinyEnterExit5MinChartsQuery(undefined, { pollingInterval: isWeekendPollingInterval })
    const { data: enterExitData, isSuccess: isEnterExitSuccess } = useGetUsersEnterExitPlanQuery()

    const [watchListSelection, setWatchListSelection] = useState('enterBufferHit')
    const [watchListIds, setWatchListsIds] = useState([])

    let tinyPreWatchContent
    if (isSuccess) { tinyPreWatchContent = watchListIds.map((id) => <SingleTinyPreWatch id={id} watchList={watchListSelection} key={`tinyFive${id}`} />) }
    else if (isLoading) { tinyPreWatchContent = <div>Loading</div> }
    else if (isError) { tinyPreWatchContent = <div>Error</div> }

    const [rotateOnFetch, setRotateOnFetch] = useState(false)
    function refetchAndRotate()
    {
        setRotateOnFetch(true)
        refetch()
        setTimeout(() => { setRotateOnFetch(false) }, [1000])
    }

    useEffect(() => { if (isEnterExitSuccess) { setWatchListsIds(enterExitData[watchListSelection].ids) } else { setWatchListsIds([]) } }, [watchListSelection])

    return (
        <div id='LHS-TinyPreWatch'>
            <MacroTinyPreWatch />
            <div id='LHS-PreWatchPlanSection'>
                <div>
                    <button onClick={() => setWatchListSelection('highImportance')} className={watchListSelection === 'highImportance' ? 'selectedWatchListButton' : 'watchListButton'}>High Importance</button>
                    <button onClick={() => setWatchListSelection('stopLossHit')} className={watchListSelection === 'stopLossHit' ? 'selectedWatchListButton' : 'watchListButton'}>Stop Loss</button>
                    <button onClick={() => setWatchListSelection('enterBufferHit')} className={watchListSelection === 'enterBufferHit' ? 'selectedWatchListButton' : 'watchListButton'}>Enter Buffer</button>
                    <button onClick={() => setWatchListSelection('plannedTickers')} className={watchListSelection === 'plannedTickers' ? 'selectedWatchListButton' : 'watchListButton'}>Planned Tickers</button>
                    <button onClick={refetchAndRotate} className={`buttonIcon ${rotateOnFetch ? 'rotateOnFetch' : 'hoverRotateOnFetch'}`}><RotateCcw color='white' /></button>
                </div>

                <div id='LHS-TinySinglePreWatchContainer' className='hide-scrollbar'>
                    {tinyPreWatchContent}
                </div>
            </div>


        </div>
    )
}

export default TinyPreWatch