import React, { useState } from 'react'

function ChartMenuBar()
{
    const [showSubChartSelection, setShowSubChartSelection] = useState(false)
    const handleSubGraphGenerate = () => { }

    return (
        <div className='ChartMenuBar'>
            <button>draw</button>
            <button onClick={() => setShowSubChartSelection(prev => !prev)}>Sub</button>

            {showSubChartSelection &&
                <div className='SubChartSelectionDropDown'>
                    <fieldset>
                        <div>
                            <label htmlFor="rsi">RSI</label>
                            <input type="checkbox" name="subGraph" id="rsi" value='rsi' />
                        </div>
                    </fieldset>
                    <button onClick={handleSubGraphGenerate()}>Show</button>
                    <button onClick={setShowSubChartSelection(false)}>Cancel</button>
                </div>}

        </div>
    )
}

export default ChartMenuBar