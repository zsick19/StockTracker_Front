import React from 'react'
import './SyncWithBackendVisual.css'
import GraphLoadingSpinner from '../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'

function SyncWithBackendVisual({ })
{
    return (
        <div id='LHS-SyncWithBackendVisual'>
            <div className='GraphLoadingSpinner'>
                <div className='spinner'></div>
                <h1>Synchronizing</h1>
            </div>
        </div>
    )
}

export default SyncWithBackendVisual