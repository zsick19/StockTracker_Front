import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

function ContinueChartingNav({ currentUnChartedTicker, handleNavigatingToNextUnChartedStock })
{

    return (
        <div id='LHS-UnChartedNavigation'>
            <p>Continue Charting</p>

            <div>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.previous} onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft color={currentUnChartedTicker.previous ? 'white' : 'gray'} /></button>
                <p>Uncharted</p>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.next} onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight color={currentUnChartedTicker.next ? 'white' : 'gray'} /></button>
            </div>

            <p>{currentUnChartedTicker.indexInfo.current + 1}/{currentUnChartedTicker.indexInfo.total} Completed</p>

            <button>Sync Progress</button>
        </div>
    )
}

export default ContinueChartingNav