import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useGetChartingDataQuery } from '../../features/Charting/ChartingSliceApi'
import { useDispatch } from 'react-redux'
import { setPreviousCharting } from '../../features/Charting/chartingElements'

function ChartWithChartingWrapper({ candleData, chartId })
{
    const dispatch = useDispatch()
    const { data: chartingData, isSuccess, isLoading, isError, refetch } = useGetChartingDataQuery({ chartId })

    useEffect(() => { if (isSuccess) { dispatch(setPreviousCharting(chartingData)) } }, [chartingData])



    return (
        <div className="ChartGraphWrapper">
            <ChartGraph candleData={candleData.candleData} mostRecentPrice={candleData.mostRecentPrice} />
        </div>
    )
}

export default ChartWithChartingWrapper