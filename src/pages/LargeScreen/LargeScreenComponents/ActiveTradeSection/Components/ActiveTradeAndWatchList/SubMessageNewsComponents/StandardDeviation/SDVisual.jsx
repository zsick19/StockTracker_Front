import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { provideSelectedDeviation } from '../../../../../../../../features/STDs/StockDetailControlSlice'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import ChartWithNoFetchWrapper from '../../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import * as short from 'short-uuid'
import './SDVisual.css'
import GraphLoadingSpinner from '../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'



function StandardDeviationVisual()
{
    const selectedDeviation = useSelector((state) => provideSelectedDeviation(state))

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({
        ticker: selectedDeviation?.Symbol || 'SPY', timeFrame: defaultTimeFrames.threeDayOneMin
        , liveFeed: true, info: false, provideNews: false
    })
    const uuid = useMemo(() => short.generate(), [])
    // console.log(data.mostRecentPrice)
    // console.log(data.mostRecentTickerCandle.ClosePrice)
    let graphVisual
    let percentDifferenceFromEMToCurrentPrice = 0
    let potentialGainPerShareFromEM = 0
    let thousandDollarShareCount = 0
    let thousandDollarGain = 0
    if (isSuccess)
    {
        graphVisual = <ChartWithNoFetchWrapper ticker={selectedDeviation?.Symbol || 'SPY'}
            candleData={data}
            mostRecentPrice={data.mostRecentPrice}
            lastCandleData={data.mostRecentTickerCandle}
            interactionController={{ isLivePrice: true, isInteractive: false, isZoomAble: true }}
            timeFrame={defaultTimeFrames.threeDayOneMin}
            EMNumbers={selectedDeviation?.EM}
            uuid={uuid}
        />
        if (selectedDeviation?.Symbol)
        {

            potentialGainPerShareFromEM = data.mostRecentPrice - selectedDeviation.Price
            percentDifferenceFromEMToCurrentPrice = (potentialGainPerShareFromEM) * 100 / selectedDeviation.Price
            thousandDollarShareCount = Math.floor(1000 / data.mostRecentPrice)
            thousandDollarGain = thousandDollarShareCount * potentialGainPerShareFromEM
        }
    } else if (isLoading)
    {
        graphVisual = <GraphLoadingSpinner />
    }

    useEffect(() =>
    {
        if (isSuccess && selectedDeviation?.Symbol
            
        )
        {
            potentialGainPerShareFromEM = data.mostRecentPrice - selectedDeviation.Price
            percentDifferenceFromEMToCurrentPrice = (potentialGainPerShareFromEM) * 100 / selectedDeviation.Price
            thousandDollarShareCount = Math.floor(1000 / data.mostRecentPrice)
            thousandDollarGain = thousandDollarShareCount * potentialGainPerShareFromEM
        }
    }, [data])


    return (
        <div id='SDCenterVisual'>
            {graphVisual}
            <div>
                <h2>{selectedDeviation?.Symbol || "SPY"}</h2>
                <p>EM Price trigger: ${selectedDeviation?.Price}</p>
                <p>{percentDifferenceFromEMToCurrentPrice.toFixed(2)}% {percentDifferenceFromEMToCurrentPrice > 0 ? 'Above' : 'Below'}</p>

                <p>With $1000</p>
                <p>Shares: {thousandDollarShareCount}</p>
                <p>Total Gain ${thousandDollarGain.toFixed(2)}</p>
                <p>${potentialGainPerShareFromEM.toFixed(2)} Gain/Share</p>
            </div>

        </div>
    )
}

export default StandardDeviationVisual