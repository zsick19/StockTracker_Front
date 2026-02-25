import React, { useEffect, useState } from 'react'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import RiskToRewardPercentFromEnter from './Visuals/RiskToRewardPercentFromEnter'
import With1000DollarsVisual from './Visuals/With1000DollarsVisual'


function PreTradePositionVisualizationWrapper({ whatPreTradeToDisplay, diagramToDisplay, setDiagramToDisplay })
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

    function providePositionVisualization()
    {
        switch (diagramToDisplay)
        {
            case 0:
                return (<>
                    <p>% Above Enter</p>
                    <RiskToRewardPercentFromEnter enterExitPlans={dataForVisual} />
                    <p>% Below Enter</p>
                </>)
            case 1: return (<>
                <p>Current Reward With $1000 Position</p>
                <With1000DollarsVisual enterExitPlans={dataForVisual} />
                <p>%s From Enter</p>
            </>)

            default:
                break;
        }
    }

    return (
        <div>
            {providePositionVisualization()}
        </div>
    )
}

export default PreTradePositionVisualizationWrapper