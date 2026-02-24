import React, { useEffect, useState } from 'react'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import RiskToRewardPercentFromEnter from './Visuals/RiskToRewardPercentFromEnter'


function PreTradePositionVisualizationWrapper({ whatPreTradeToDisplay })
{

    const { data: combinedData } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: (results) => ({ ...results, data: selectAllPlansAndCombined(results) }) })
    const [dataForVisual, setDataForVisual] = useState([])

    useEffect(() =>
    {
        if (!combinedData) return

        if (whatPreTradeToDisplay === 'enterBufferPositionVisuals' && combinedData.counts.enterBuffer === 0)
        {
            setDataForVisual(combinedData.combined)
        } else
        {

            switch (whatPreTradeToDisplay)
            {
                case 'allPositionVisuals': setDataForVisual(combinedData.combined); break;
                case 'highImportancePositionVisuals': setDataForVisual(combinedData.highImportance); break;
                case 'stopLossPositionVisuals': setDataForVisual(combinedData.stopLossHit); break;
                case 'plannedPositionVisuals': setDataForVisual(combinedData.allOtherPlans); break;
                default: setDataForVisual(combinedData.enterBuffer); break;
            }
        }
    }, [combinedData, whatPreTradeToDisplay])

    return (
        <div>
            <p>% Above Enter</p>
            <RiskToRewardPercentFromEnter enterExitPlans={dataForVisual} />
            <p>% Below Enter</p>
        </div>
    )
}

export default PreTradePositionVisualizationWrapper