import React, { useMemo } from 'react'
import MacroWatchList from './MacroWatchList'
import { selectMacroWatchListsFromUser } from '../../../../../features/Initializations/InitializationSliceApi'
import { useSelector } from 'react-redux'

function MacroWatchListContainer({ setPrimaryChartTicker, setSecondaryChartTicker })
{
    const memoizedSelectedWatchlist = selectMacroWatchListsFromUser({ userId: '6952bd331482f8927092ddcc' })
    const usersMacroWatchList = useSelector(memoizedSelectedWatchlist)

    let watchListVisual
    if (usersMacroWatchList.isSuccess)
    {
        watchListVisual = usersMacroWatchList.macroWatchLists.map((watch) => <MacroWatchList watchList={watch} setPrimaryChartTicker={setPrimaryChartTicker} setSecondaryChartTicker={setSecondaryChartTicker} />)

    }
    else if (usersMacroWatchList.isLoading) { watchListVisual = <div>Loading...</div> }
    else if (usersMacroWatchList.isError)
    {
        watchListVisual = <div> Error
            <button onClick={usersMacroWatchList.refetch}>Refetch</button>
        </div>
    }




    return (
        <div id='LSH-MacroWatchListContainer'>
            {watchListVisual}
        </div>
    )
}

export default MacroWatchListContainer