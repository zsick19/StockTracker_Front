import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import './ChartVisibilityDropDown.css'
import { setIndividualAnyVisibility, setIndividualPreviousVisibility, setToggleAllVisibility, setToggleOnlyEnterExitVisibility } from '../../features/Charting/ChartingVisibility'
import { AlignEndHorizontal, AlignStartHorizontal, GitCommitHorizontal, Key, KeyRound, Pen, TrendingUp, WavesArrowUp } from 'lucide-react'

function ChartVisibilityDropDown({ uuid, setShowVisibilitySelect })
{
    const dispatch = useDispatch()

    return (
        <>
            <div className='studySelectOverlay' onClick={() => setShowVisibilitySelect(false)}></div>
            <div className='chartVisibilityDropDown'>

                <div >
                    <button onClick={(e) => { e.stopPropagation(); dispatch(setToggleOnlyEnterExitVisibility({ uuid })); setShowVisibilitySelect(false) }}>Display Only E/X</button>

                    <button onClick={(e) => { e.stopPropagation(); dispatch(setToggleAllVisibility({ uuid })); setShowVisibilitySelect(false) }}>Show/Hide All</button>
                    <button>Show/Hide Previous</button>
                </div>
                <div>

                    <div>
                        <p><GitCommitHorizontal size={16} /> Price Lines</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'linesH' })) }}>Any</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'linesH' })) }}>Previous</button>
                    </div>
                    <div>
                        <p><Pen size={14} /> Free Lines</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'freeLines' })) }}>Any</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'freeLines' })) }}>Previous</button>
                    </div>
                    <div>
                        <p><WavesArrowUp size={14} /> Volume Nodes</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'volNodes' })) }}>Any</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'volNodes' })) }}>Previous</button>
                    </div>
                    <div>
                        <p><AlignEndHorizontal size={16} /> Supp/Resis</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'supportResistance' })) }}>Any</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'supportResistance' })) }}>Previous</button>
                    </div>
                    <div>
                        <p><TrendingUp size={16} /> Trend Lines</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'trendLines' })) }}>Any</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'trendLines' })) }}>Previous</button>
                    </div>
                    <div>
                        <p><KeyRound size={16} /> Macro Levels</p>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualAnyVisibility({ uuid, chartingElement: 'keyLevels' })) }}>Any</button>
                        <button onClick={(e) => { e.stopPropagation(); dispatch(setIndividualPreviousVisibility({ uuid, chartingElement: 'keyLevels' })) }}>Previous</button>
                    </div>
                </div>






            </div>
        </>
    )
}

export default ChartVisibilityDropDown