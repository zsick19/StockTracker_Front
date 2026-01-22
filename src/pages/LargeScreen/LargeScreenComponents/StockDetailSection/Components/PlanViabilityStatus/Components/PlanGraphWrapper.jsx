import React from 'react'
import SinglePlanViabilityChartWrapper from './SinglePlanViabilityChartWrapper'
import { useGetGroupedBy12StockDataInfiniteQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import { Virtuoso } from 'react-virtuoso';

function PlanGraphWrapper({ ids, watchList, selectedPlansForRemoval, handleRemovalToggle })
{
    let totalIdsPreWatch = ids.length
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isSuccess, isFetching, isError } = useGetGroupedBy12StockDataInfiniteQuery({ ids, total: totalIdsPreWatch });
    const detailedItems = data?.pages.flat() || [];


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
        <div onScroll={handleScroll} id='PlanViabilityChartsWrapper' className='hide-scrollbar'>
            {detailedItems.map(item => (<SinglePlanViabilityChartWrapper id={item.ticker} watchList={watchList} candleData={[]} selectedPlansForRemoval={selectedPlansForRemoval} handleRemovalToggle={handleRemovalToggle} />))}
            {isFetchingNextPage && <div>Loading more...</div>}
        </div>
    );
}





export default PlanGraphWrapper