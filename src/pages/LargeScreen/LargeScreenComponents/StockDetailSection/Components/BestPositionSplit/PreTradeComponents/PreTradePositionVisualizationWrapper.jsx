import React, { useEffect, useState } from 'react'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import RiskToRewardPercentFromEnter from './Visuals/RiskToRewardPercentFromEnter'
import With1000DollarsVisual from './Visuals/With1000DollarsVisual'


function PreTradePositionVisualizationWrapper({ dataForVisual, whatPreTradeToDisplay, diagramToDisplay, setDiagramToDisplay })
{


    function providePositionVisualization()
    {
        switch (diagramToDisplay)
        {
            case 0:
                return (<>
                    <p>% Above Enter</p>
                    <div className='PositionGraphWithLeftRightText'>
                        <p>Risk %</p>
                        <RiskToRewardPercentFromEnter enterExitPlans={dataForVisual} />
                        <p>Reward %</p>
                    </div>
                    <p>% Below Enter</p>
                </>)
            case 1: return (<>
                <p>Total Gain</p>
                <div className='PositionGraphWithLeftRightText'>
                    <p>% Below Enter</p>
                    <With1000DollarsVisual enterExitPlans={dataForVisual} />
                    <p>% Above Enter</p>
                </div>
                <p>Total Risk</p>
            </>)
        }
    }

    return (
        <div>
            {providePositionVisualization()}
        </div>
    )
}

export default PreTradePositionVisualizationWrapper