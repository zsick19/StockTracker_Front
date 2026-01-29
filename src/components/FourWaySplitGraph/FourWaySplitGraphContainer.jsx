import React, { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedIndexTimeFrame } from '../../features/SelectedStocks/SelectedStockSlice'
import { defaultTimeFrames } from '../../Utilities/TimeFrames'
import { useGetStockDataUsingTimeFrameQuery } from '../../features/StockData/StockDataSliceApi'
import GraphLoadingError from '../ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import ChartWithChartingWrapper from '../ChartSubGraph/ChartWithChartingWrapper'
import './FourWaySplitGraph.css'
import * as short from 'short-uuid'
import TimeFrameDropDown from '../ChartMenuDropDowns/TimeFrameDropDown'
import StudySelectPopover from '../ChartMenuDropDowns/StudySelectPopover'
import { ChartCandlestick, FlaskConical, Scale3D } from 'lucide-react'
import { setResetXYZoomState } from '../../features/Charting/GraphHoverZoomElement'

function FourWaySpitGraphContainer({ selectedStock, index })
{
    const dispatch = useDispatch()
    const uuid = useMemo(() => short.generate(), [])
    let interactions = { nonLivePrice: false, nonInteractive: true, nonZoomAble: false }

    const [showTimeFrameSelect, setShowTimeFrameSelect] = useState(false)
    const [showStudiesSelect, setShowStudiesSelect] = useState(false)

    const { data: stockData, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: selectedStock.ticker, timeFrame: selectedStock.timeFrame, liveFeed: true })


    let graphVisual
    if (isSuccess && stockData.candleData.length > 0)
    {
        graphVisual = <ChartWithChartingWrapper ticker={selectedStock.ticker} candleData={stockData} chartId={selectedStock?._id}
            timeFrame={selectedStock.timeFrame} uuid={uuid} interactionController={interactions}
            candlesToKeepSinceLastQuery={stockData.candlesToKeepSinceLastQuery} lastCandleData={stockData.mostRecentTickerCandle} />

    } else if (isSuccess) graphVisual = <div>No data to display for this ticker</div>
    else if (isLoading) graphVisual = <GraphLoadingSpinner />
    else if (isError) graphVisual = <GraphLoadingError />

    function handleTimeFrameChange(e)
    {
        let timeFrameSelection
        if (e.target.name === 'timeFrameIntra')
        {
            switch (e.target.id)
            {
                case '1m': timeFrameSelection = defaultTimeFrames.threeDayOneMin; break;
                case '2m': timeFrameSelection = defaultTimeFrames.threeDayTwoMin; break;
                case '5m': timeFrameSelection = defaultTimeFrames.threeDayFiveMin; break;
                case '15m': timeFrameSelection = defaultTimeFrames.threeDayFifteenMin; break;
                case '30m': timeFrameSelection = defaultTimeFrames.threeDayThirtyMin; break;
            }
        }
        else if (e.target.name === 'timeFrameHour') { timeFrameSelection = defaultTimeFrames.threeDayOneHour }
        else if (e.target.name === 'timeFrameDay') { timeFrameSelection = defaultTimeFrames.dailyOneYear }
        else if (e.target.name === 'timeFrameWeek') { timeFrameSelection = defaultTimeFrames.weeklyOneYear }

        setShowTimeFrameSelect(false)
        dispatch(setSelectedIndexTimeFrame({ index: index, timeFrame: timeFrameSelection }))
    }

    function handleStudySelectChange(e)
    {

    }

    return (
        <div className='LSH-FourWaySplitContainer'>
            {showTimeFrameSelect && <TimeFrameDropDown handleTimeFrameChange={handleTimeFrameChange} setShowTimeFrameSelect={setShowTimeFrameSelect} />}
            {showStudiesSelect && <StudySelectPopover handleStudySelectChange={handleStudySelectChange} setShowStudiesSelect={setShowStudiesSelect} />}
            <div className='LSH-4WayGraphHeader'>
                <div className='flex'>
                    <h3>{selectedStock.ticker}</h3>
                </div>
                <button className='timeFrameButton' onClick={() => { setShowTimeFrameSelect(true); setShowStudiesSelect(false) }}>{selectedStock.timeFrame.increment}{selectedStock.timeFrame.unitOfIncrement}</button>
                <button className='buttonIcon' onClick={() => { setShowTimeFrameSelect(false); setShowStudiesSelect(true) }}><FlaskConical size={18} color='white' /></button>
                <button className='buttonIcon' onClick={() => dispatch(setResetXYZoomState({ uuid }))} ><Scale3D size={18} color='white' /></button>
                <button className='buttonIcon' onClick={() => dispatch(setResetXYZoomState({ uuid }))} ><ChartCandlestick size={18} color='white' /></button>
            </div>
            {graphVisual}
        </div>
    )
}

export default FourWaySpitGraphContainer