import React, { useEffect, useState } from 'react'
import PreTradePositionVisualizationWrapper from './PreTradePositionVisualizationWrapper'
import PreTradePositionController from './PreTradePositionController'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function PreTradePositionContainer({ diagramToDisplay, setDiagramToDisplay })
{
    const [whatPreTradesToDisplay, setWhatPreTradesToDisplay] = useState('allPositionVisuals')


    const { data: combinedData } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: (results) => ({ ...results, data: selectAllPlansAndCombined(results) }) })
    const [dataForVisual, setDataForVisual] = useState([])


    useEffect(() =>
    {
        if (!combinedData) return

        switch (whatPreTradesToDisplay)
        {
            case 'allPositionVisuals': setDataForVisual(combinedData.combined); break;
            case 'highImportancePositionVisuals': setDataForVisual(combinedData.highImportance); break;
            case 'stopLossPositionVisuals': setDataForVisual(combinedData.stopLossHit); break;
            case 'plannedPositionVisuals': setDataForVisual(combinedData.allOtherPlans); break;
            case 'enterBufferPositionVisuals': setDataForVisual(combinedData.enterBuffer); break;
        }

    }, [combinedData, whatPreTradesToDisplay])




    return (
        <div className='PreTradePositionSplitContainer'>
            <PreTradePositionVisualizationWrapper dataForVisual={dataForVisual} whatPreTradeToDisplay={whatPreTradesToDisplay} setDiagramToDisplay={setDiagramToDisplay} diagramToDisplay={diagramToDisplay} />
            <PreTradePositionController dataForVisual={dataForVisual} whatPreTradeToDisplay={whatPreTradesToDisplay} setWhatPreTradesToDisplay={setWhatPreTradesToDisplay} setDiagramToDisplay={setDiagramToDisplay} diagramToDisplay={diagramToDisplay} />
        </div>
    )
}

export default PreTradePositionContainer