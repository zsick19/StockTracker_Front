import React, { useEffect, useState } from 'react'
import { useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import MacroTinyTickerContainer from './MacroTinyTickerContainer'

function MacroTinyPreWatch()
{
    const [showSelectedSingleMacro, setShowSelectedSingleMacro] = useState(false)
    const [selectedMacroWatchList, setSelectedMacroWatchList] = useState(0)
    const [selectedMacroTickerIds, setSelectedMacroTickerIds] = useState([])

    const { data, isSuccess, isError, isLoading, error, refetch } = useFetchUsersMacroWatchListQuery()

    let macroSelection
    if (isSuccess)
    {
        macroSelection = (<>{data.watchLists.map((watch, i) => <button onClick={() => setSelectedMacroWatchList(i)}>{watch.title}</button>)}</>)
    } else if (isError || isLoading)
    {
        macroSelection = (<>
            <button onClick={() => setSelectedMacroWatchList(0)}>Major</button>
            <button onClick={() => setSelectedMacroWatchList(1)}>Sectors</button>
            <button onClick={() => setSelectedMacroWatchList(2)}>Metals</button>
            <button onClick={() => setSelectedMacroWatchList(3)}>Industry</button>
        </>)
    }


    useEffect(() =>
    {
        if (isSuccess)
        {
            let tickersIds = data.watchLists[selectedMacroWatchList].tickersContained.map((ticker) => ticker.ticker)
            setSelectedMacroTickerIds(tickersIds)
        } else setSelectedMacroTickerIds([])
    }, [selectedMacroWatchList])

    return (
        <section id='MacroTinyPreWatchSection'>
            {showSelectedSingleMacro ?
                <div id='SingleSelectedTinyMacro'>
                    single macro chart
                </div> : <MacroTinyTickerContainer selectedMacroTickerIds={selectedMacroTickerIds} setShowSelectedSingleMacro={setShowSelectedSingleMacro} />}
            <div id='MacroTinyWatchListSelect'>
                <div className='hide-scrollbar'>
                    {macroSelection}
                </div>
            </div>

        </section>
    )
}

export default MacroTinyPreWatch