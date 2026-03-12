import { useDispatch } from 'react-redux';
import { useFetchUsersMacroWatchListQuery } from '../../../../../../features/WatchList/WatchListStreamingSliceApi';
import { ChevronDown, CircleMinus } from 'lucide-react';
import { setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice';
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice';

function SingleWatchListTicker({ tickerId, setPrimaryChartTicker, setSecondaryChartTicker, index, isDeleteAble })
{
    const dispatch = useDispatch()
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[tickerId] }), });
    if (!item) return null;


    return (
        <div className={`${index % 2 == 0 && 'everyOther'} ${item.currentDayPercentGain > 0 ? 'positiveGreenFont' : item.currentDayPercentGain < 0 ? 'negativeRedFont' : 'neutralGrayFont'} LSH-SingleTickerTitle`}        >

            <p title={item?.tickerTitle}
                onClick={() => setPrimaryChartTicker(item)}
                onDoubleClick={() => { setPrimaryChartTicker(item); setSecondaryChartTicker(item) }}
                onContextMenu={(e) => { e.preventDefault(); setSecondaryChartTicker(item) }}>{item.ticker}</p>
            <p onClick={() =>
            {
                dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: item.ticker, chartId: item._id }));
                dispatch(setStockDetailState(5))
            }}>${item.mostRecentPrice.toFixed(2)}</p>
            <p>{item.currentDayPercentGain.toFixed(2)}%</p>
            {isDeleteAble && <button onClick={(e) => { e.stopPropagation(); attemptRemoveTickerFromWatchList(item) }}><CircleMinus size={16} color='white' /></button>}
        </div>
    )
}

export default SingleWatchListTicker