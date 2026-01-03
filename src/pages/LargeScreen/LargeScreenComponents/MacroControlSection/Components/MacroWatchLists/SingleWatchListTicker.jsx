import { useFetchUsersMacroWatchListQuery } from '../../../../../../features/WatchList/WatchListStreamingSliceApi';
import { ChevronDown, CircleMinus } from 'lucide-react';

function SingleWatchListTicker({ tickerId, setPrimaryChartTicker, setSecondaryChartTicker, index })
{
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[tickerId] }), });
    if (!item) return null;

    return (
        <div className={`${index % 2 == 0 && 'everyOther'} ${item.currentDayPercentGain > 0 ? 'positiveGreenFont' : item.currentDayPercentGain < 0 ? 'negativeRedFont' : 'neutralGrayFont'} LSH-SingleTickerTitle`} onClick={() => setPrimaryChartTicker(item)} onDoubleClick={() => { setPrimaryChartTicker(item); setSecondaryChartTicker(item) }}>
            <button onClick={(e) => { e.stopPropagation(); setSecondaryChartTicker(item) }}><ChevronDown size={16} color='white' /></button>
            <p>{item.ticker}</p>
            <p>${item.mostRecentPrice}</p>
            <p>{item.currentDayPercentGain.toFixed(2)}%</p>
            <button onClick={(e) => { e.stopPropagation(); attemptRemoveTickerFromWatchList(item) }}><CircleMinus size={16} color='white' /></button>
        </div>
    )
}

export default SingleWatchListTicker