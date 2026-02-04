import MacroWatchList from './MacroWatchList'
import { useFetchUsersMacroWatchListQuery } from '../../../../../../features/WatchList/WatchListStreamingSliceApi'

function MacroWatchListContainer({ setPrimaryChartTicker, setSecondaryChartTicker })
{
    const { data, isSuccess, isError, isLoading, error, refetch } = useFetchUsersMacroWatchListQuery()

    let watchListVisual
    if (isSuccess)
    {
        watchListVisual = data.watchLists.map((watchList) => <MacroWatchList watchList={watchList} setPrimaryChartTicker={setPrimaryChartTicker} setSecondaryChartTicker={setSecondaryChartTicker} />)
    }
    else if (isLoading) { watchListVisual = <div>Loading...</div> }
    else if (isError)
    {
        watchListVisual = <div>
            <p>Error</p>
            <button onClick={refetch}>Refetch</button>
        </div>
    }

    return (
        <div id='LSH-MacroWatchListContainer'>
            {watchListVisual}
        </div>
    )
}

export default MacroWatchListContainer