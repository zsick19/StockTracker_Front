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
            <div>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.previous} onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft color={currentUnChartedTicker.previous ? 'white' : 'gray'} /></button>
                <p>Unplanned</p>
                <button className='buttonIcon' disabled={!currentUnChartedTicker.next} onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight color={currentUnChartedTicker.next ? 'white' : 'gray'} /></button>
            </div>
            <button>Sync Progress</button>
        </div>
    )
}

export default ContinueChartingNav