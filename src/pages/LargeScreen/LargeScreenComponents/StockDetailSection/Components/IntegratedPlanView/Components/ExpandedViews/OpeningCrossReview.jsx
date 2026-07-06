import React from 'react'
import { OpenCrossMetricsSummaryHUD } from '../SubComponents/OpenCrossMetricsSummaryHUD'
import { AuctionVectorTrendChart } from '../SubComponents/AuctionVectorTrendChart'

function OpeningCrossReview({ plan })
{
    return (
        <div>
            <OpenCrossMetricsSummaryHUD planData={plan} livePrice={plan.mostRecentPrice} />
            <AuctionVectorTrendChart planData={plan} />
        </div>
    )
}

export default OpeningCrossReview