import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setConfirmedUnChartedData } from '../../../../../../../features/SelectedStocks/PreviousNextStockSlice'
import { useGetUsersConfirmedSummaryQuery } from '../../../../../../../features/MarketSearch/ConfirmedStatusSliceApi'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useUpdateChartingDataMutation } from '../../../../../../../features/Charting/ChartingSliceApi'
import { makeSelectChartAlteredByTicker } from '../../../../../../../features/Charting/chartingElements'

function ContinueChartingNav({ currentUnChartedTicker, setShowUnchartedList, handleNavigatingToNextUnChartedStock })
{
    const dispatch = useDispatch()
    const [updateChartingData] = useUpdateChartingDataMutation()
    const { data, isSuccess, isError, isLoading, error, refetch } = useGetUsersConfirmedSummaryQuery(undefined, { refetchOnMountOrArgChange: true })

    const selectedChartingMemo = useMemo(makeSelectChartAlteredByTicker, [])
    const chartingAltered = useSelector(state => selectedChartingMemo(state, currentUnChartedTicker.current?.ticker))



    useEffect(() =>
    {
        if (isSuccess)
        {
            dispatch(setConfirmedUnChartedData(data))
            const firstToBeCharted = data.find((t) => t.status < 2)
            if (firstToBeCharted) { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: firstToBeCharted.tickerSymbol, chartId: firstToBeCharted._id })) }
        }
    }, [data])

    async function attemptToSyncCharted()
    {
        dispatch(setStockDetailState(10))
        setTimeout(() => { dispatch(setStockDetailState(5)) }, [2000])
    }

    async function attemptSavingCharting()
    {
        try
        {
            if (chartingAltered.altered) { await updateChartingData({ ticker: currentUnChartedTicker.current.ticker, chartId: currentUnChartedTicker.current.chartId }).unwrap() }
        } catch (error)
        {
            console.log(error)
        }
    }




    return (
        <div id='LHS-UnChartedNavigation'>
            {currentUnChartedTicker.indexInfo.total < 1 ?
                <div>No Uncharted</div> :
                <>
                    <div>
                        <button className='buttonIcon' disabled={!currentUnChartedTicker.previous} onClick={() => { attemptSavingCharting(); handleNavigatingToNextUnChartedStock(false) }}><ChevronLeft color={currentUnChartedTicker.previous ? 'white' : 'gray'} /></button>
                        <button onClick={() => setShowUnchartedList(prev => !prev)}>Show Progress</button>
                        <button className='buttonIcon' disabled={!currentUnChartedTicker.next} onClick={() => { attemptSavingCharting(); handleNavigatingToNextUnChartedStock(true) }}><ChevronRight color={currentUnChartedTicker.next ? 'white' : 'gray'} /></button>
                    </div>

                    <p>{currentUnChartedTicker.indexInfo.current + 1}/{currentUnChartedTicker.indexInfo.total} Completed</p>
                    <button onClick={() => attemptToSyncCharted()}>Sync Charted</button>
                </>
            }
        </div>
    )
}

export default ContinueChartingNav