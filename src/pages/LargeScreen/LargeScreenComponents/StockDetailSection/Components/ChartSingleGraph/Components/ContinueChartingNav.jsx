import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

function ContinueChartingNav({ currentUnChartedTicker, handleNavigatingToNextUnChartedStock })
{


    return (
        <div id='LHS-UnChartedNavigation'>
            <p>Continue Charting</p>

            <div>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.previous} onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft color='white' /></button>
                <p>Uncharted</p>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.next} onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight color='white' /></button>
            </div>
            <div>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.previous} onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft color='white' /></button>
                <p>Unplanned</p>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.next} onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight color='white' /></button>
            </div>
            <button>Sync Progress</button>
        </div>
    )
}

export default ContinueChartingNav