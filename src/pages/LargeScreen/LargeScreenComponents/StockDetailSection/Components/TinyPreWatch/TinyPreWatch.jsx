import React, { useEffect, useState } from 'react'
import { useGetTinyEnterExit5MinChartsQuery, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SingleTinyPreWatch from './Components/SingleTinyPreWatch'
import './TinyPreWatch.css'
import { isWeekend } from 'date-fns'
import { CircleArrowLeft, CircleArrowRight, RefreshCcw, RotateCcw } from 'lucide-react'
import ExpandedPreWatch from './Components/ExpandedPreWatch'
import './PlanInfoDisplay.css'

function TinyPreWatch()
{
    let isWeekendPollingInterval = isWeekend(new Date()) ? 0 : 300000
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetTinyEnterExit5MinChartsQuery(undefined,
        { pollingInterval: isWeekendPollingInterval })
    const { data: enterExitData, isSuccess: isEnterExitSuccess, refetch: refetchPlans } = useGetUsersEnterExitPlanQuery(undefined,
        { pollingInterval: isWeekendPollingInterval })


    const [selectedTickerIndex, setSelectedTickerIndex] = useState(-1)
    const [watchListSelection, setWatchListSelection] = useState('enterBufferHit')
    const [watchListIds, setWatchListsIds] = useState([])

    let tinyPreWatchContent
    if (isSuccess) { tinyPreWatchContent = watchListIds.map((id, i) => <SingleTinyPreWatch key={`${id}tiny`} id={id} index={i} setSelectedTickerIndex={setSelectedTickerIndex} />) }
    else if (isLoading) { tinyPreWatchContent = <div>Loading</div> }
    else if (isError) { tinyPreWatchContent = <div>Error</div> }


    useEffect(() =>
    {
        if (isEnterExitSuccess && isSuccess)
        {
            setWatchListsIds(enterExitData[watchListSelection].ids)
            tinyPreWatchContent = watchListIds.map((id, i) => <SingleTinyPreWatch key={`${id}tiny`} id={id} index={i} setSelectedTickerIndex={setSelectedTickerIndex} />)
        } else
        {
            setWatchListsIds([])
            setSelectedTickerIndex(-1)
            tinyPreWatchContent = []
        }

    }, [watchListSelection, enterExitData, data])

    useEffect(() =>
    {
        if (isEnterExitSuccess && isSuccess) { setSelectedTickerIndex(0) }
        else { setSelectedTickerIndex(-1) }

    }, [watchListSelection])

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
            <div id='LHS-TinyPreAsList' onDoubleClick={() => { refetchPlans(); refetch() }}>
                <div className='LHS-TinyListHeader'>
                    <p onClick={handleWatchListChange}>{watchListSelection === 'enterBufferHit' ? 'Enter Buffer' : 'Stop Loss'}</p>
                    <button className='buttonIcon' onClick={() => handlePlanNav(false)}><CircleArrowLeft color='white' /></button>
                    <button className='buttonIcon' onClick={() => handlePlanNav(true)}><CircleArrowRight color='white' /></button>
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