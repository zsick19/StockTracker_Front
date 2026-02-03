import { useGetGroupedBy12StockDataInfiniteQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import SinglePreWatchChartWrapper from './SinglePreWatchChartWrapper';

function PreWatchManyPlanWrapper({ ids, watchList })
{
    let totalIdsPreWatch = ids.length
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isSuccess, isFetching, isError } = useGetGroupedBy12StockDataInfiniteQuery({ ids, total: totalIdsPreWatch });
    const candleStockData = data?.pages.flat() || [];


    const handleScroll = (e) =>
    {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50)
        {
            // 50px threshold
            if (hasNextPage && !isFetchingNextPage) { fetchNextPage(); }
        }
    };



    return (
        <div onScroll={handleScroll} id='PreWatchManyChartsWrapper' className='hide-scrollbar'>
            {totalIdsPreWatch > 0 ? <>
                {candleStockData.map(item => <SinglePreWatchChartWrapper id={item.ticker} watchList={watchList} candleData={item.candleData} />)}
                {isFetchingNextPage && <div>Loading more...</div>}
            </>
                : <div>Currently No Plans</div>}
        </div>
    );
}

export default PreWatchManyPlanWrapper