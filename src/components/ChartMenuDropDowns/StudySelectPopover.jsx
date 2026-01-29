import React from 'react'
import './StudySelectPopover.css'


function StudySelectPopover({ handleStudySelectChange, setShowStudiesSelect })
{
    return (
        <>
            <div className='studySelectOverlay' onClick={() => setShowStudiesSelect(false)}></div>
            <div className='LSH-StudySelectPopover'>
                <fieldset>
                    <label htmlFor="">RSI</label>
                    <input type="checkbox" name="" id="" />
                </fieldset>
            </div>
        </>
    )
}

export default StudySelectPopover