import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import './ChartVisibilityDropDown.css'
import { setIndividualAnyVisibility, setIndividualPreviousVisibility, setToggleAllVisibility, setToggleOnlyEnterExitVisibility } from '../../features/Charting/ChartingVisibility'

function ChartVisibilityDropDown({ uuid, setShowVisibilitySelect })
{
    const dispatch = useDispatch()

    const [levelOfDetails, setLevelOfDetail] = useState(0)
    return (
        <>
            <div className='studySelectOverlay' onClick={() => setShowVisibilitySelect(false)}></div>
            <div className='chartVisibilityDropDown'>

                {levelOfDetails === 1 ? <div>

                    <div>
                        <p>H Lines</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'linesH' })) }}>Any H LInes</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'linesH' })) }}>Previous H LInes</button>
                    </div>
                    <div>
                        <p>Free Lines</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'freeLines' })) }}>Any Free LInes</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'freeLines' })) }}>Previous Free LInes</button>
                    </div>
                    <div>
                        <p>Volume Nodes</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'volNodes' })) }}>Any Volume Nodes</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'volNodes' })) }}>Previous Volume Nodes</button>
                    </div>
                    <div>
                        <p>Support Resistances</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'supportResistance' })) }}>Any Support Resistance</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'supportResistance' })) }}>Previous Support Resistance</button>
                    </div>
                    <div>
                        <p>Trend Lines</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'trendLines' })) }}>Any Trend Line</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'trendLines' })) }}>Previous Trend Lines</button>
                    </div>
                    <div>
                        <p>key Levels</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'keyLevels' })) }}>Any Key Levels</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'keyLevels' })) }}>Previous Key Levels</button>
                    </div>




                    <br />

                </div> : <div>

                    <div>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setToggleAllVisibility({ uuid })); setShowVisibilitySelect(false) }}>Show/Hide All</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setToggleOnlyEnterExitVisibility({ uuid })); setShowVisibilitySelect(false) }}>Display Only E/X</button>
                    </div>

                    <div>
                        <p>Previous Charting</p>
                        <button>Show</button>
                        <button>Hide</button>
                    </div>

                </div>}
                <button onClick={() => setLevelOfDetail(0)}>General</button>
                <button onClick={() => setLevelOfDetail(1)}>Detailed</button>

            </div>
        </>
    )
}

export default ChartVisibilityDropDown