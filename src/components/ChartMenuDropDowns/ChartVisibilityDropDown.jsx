import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import './ChartVisibilityDropDown.css'
import { setToggleAllVisibility, setToggleOnlyEnterExitVisibility } from '../../features/Charting/ChartingVisibility'

function ChartVisibilityDropDown({ uuid, setShowVisibilitySelect })
{
    const dispatch = useDispatch()

    const [levelOfDetails, setLevelOfDetail] = useState(0)
    return (
        <>
            <div className='studySelectOverlay' onClick={() => setShowVisibilitySelect(false)}></div>
            <div className='chartVisibilityDropDown'>

                {levelOfDetails === 1 ? <div>
                    <p>Define deep detail</p>
                    <p>pick a element subset to turn on/off</p>
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