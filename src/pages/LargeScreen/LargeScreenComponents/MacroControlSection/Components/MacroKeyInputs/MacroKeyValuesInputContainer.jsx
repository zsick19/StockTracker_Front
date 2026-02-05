import React, { useState } from 'react'
import './MacroKeyValuesInput.css'
import SelectedKeyInputForm from './SelectedKeyInputForm'
import GeneralMacroKeyInputForm from './GeneralMacroKeyInputForm'

function MacroKeyValuesInputContainer({ selectedStock, setShowMacroKeyLevelDisplay })
{
    const [showOnlySelectedForm, setShowOnlySelectedForm] = useState(true)
    const [showDailyWeeklyMonthly, setShowDailyWeeklyMonthly] = useState(0)
    return (
        <div id='LSH-MacroKeyValueInput'>
            <div className='flex'>
                {showOnlySelectedForm ? <h1>Macro Key Values for {selectedStock.ticker}</h1> : <p>Macro Key Values</p>}
                <div>
                    <button onClick={() => setShowDailyWeeklyMonthly(0)}>Daily</button>
                    <button onClick={() => setShowDailyWeeklyMonthly(1)}>Weekly</button>
                    <button onClick={() => setShowDailyWeeklyMonthly(2)}>Monthly</button>
                </div>
                <button onClick={() => setShowOnlySelectedForm(prev => !prev)}>{showOnlySelectedForm ? 'All Macros' : 'Selected Macro'}</button>
            </div>
            {showOnlySelectedForm ?
                <SelectedKeyInputForm selectedStock={selectedStock} setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} showDailyWeeklyMonthly={showDailyWeeklyMonthly} /> :
                <GeneralMacroKeyInputForm setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} />}
        </div>
    )
}

export default MacroKeyValuesInputContainer