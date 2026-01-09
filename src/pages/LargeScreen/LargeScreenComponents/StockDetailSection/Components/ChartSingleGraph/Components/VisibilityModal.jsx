import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectChartVisibility, setAllVisibility } from '../../../../../../../features/Charting/ChartingVisibility'

function VisibilityModal({ setShowVisibilityModal })
{
    const dispatch = useDispatch()
    const [visibilityEdit, setVisibilityEdit] = useState(useSelector(selectChartVisibility))

    function handleVisibilityChange(e)
    {
        setVisibilityEdit(prev => ({ ...prev, trendLines: e.target.checked }))
    }

    function submitVisibilityControl(e)
    {
        e.preventDefault()
        dispatch(setAllVisibility(visibilityEdit))
        setShowVisibilityModal(false)
    }

    return (
        <>
            <div className='SingleChartModalUnderlay' onClick={() => setShowVisibilityModal(false)}></div>
            <div id='LHS-SingleChartVisibilityModal' onClick={(e) => e.stopPropagation()}>

                <form onSubmit={(e) => submitVisibilityControl(e)} onChange={handleVisibilityChange}>
                    <div>
                        <label htmlFor="trendLines">Trend Lines</label>
                        <input type="checkbox" name="visControl" id="trendLines" defaultChecked={visibilityEdit.trendLines} />
                    </div>

                    
                        <button >Submit</button>


                </form>

                <button onClick={() => setShowVisibilityModal(false)}>Close</button>
            </div>
        </>
    )
}

export default VisibilityModal