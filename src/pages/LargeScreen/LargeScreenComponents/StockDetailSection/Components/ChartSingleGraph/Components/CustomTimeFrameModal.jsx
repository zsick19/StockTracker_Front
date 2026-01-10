import React from 'react'

function CustomTimeFrameModal({ timeFrame, setTimeFrame, setShowCustomTimeFrameModal })
{

    return (
        <>
            <div className='SingleChartModalUnderlay' onClick={() => setShowCustomTimeFrameModal(false)} ></div>
            <div className='LHS-SingleChartModal' onClick={(e) => e.stopPropagation()}>
                CustomTimeFrameModal
                <button onClick={() => setShowCustomTimeFrameModal(false)}>close</button>
            </div>
        </>
    )
}

export default CustomTimeFrameModal