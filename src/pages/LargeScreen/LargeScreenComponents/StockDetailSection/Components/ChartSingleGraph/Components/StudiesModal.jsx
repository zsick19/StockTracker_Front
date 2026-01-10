import React from 'react'

function StudiesModal({ setShowStudiesModal })
{
    return (
        <>
            <div className='SingleChartModalUnderlay' onClick={() => setShowStudiesModal(false)}></div>
            <div className='LHS-SingleChartModal' onClick={(e) => e.stopPropagation()}>

                <h1>Studies</h1>
                <p>Pick the studies to show</p>



                <button onClick={() => setShowStudiesModal(false)}>Close</button>
            </div>
        </>
    )
}

export default StudiesModal