import MacroWatchList from './MacroWatchList'
import { selectMacroWatchListsFromUser } from '../../../../../features/Initializations/InitializationSliceApi'
import { useSelector } from 'react-redux'
import { useFetchUsersMacroWatchListQuery } from '../../../../../features/WatchList/WatchListStreamingSliceApi'

function MacroWatchListContainer({ setPrimaryChartTicker, setSecondaryChartTicker })
{
    const memoizedSelectedWatchlist = selectMacroWatchListsFromUser({ userId: '6952bd331482f8927092ddcc' })
    const usersMacroWatchList = useSelector(memoizedSelectedWatchlist)

    const { data, isSuccess, isError, isLoading, error } = useFetchUsersMacroWatchListQuery()
    console.log(data)


    let watchListVisual
    if (isSuccess)
    {
        watchListVisual = data.watchLists.map((watch) => <MacroWatchList watchList={watch} setPrimaryChartTicker={setPrimaryChartTicker} setSecondaryChartTicker={setSecondaryChartTicker} />)
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