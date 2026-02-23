import React, { useState } from 'react'
import './MacroKeyValuesInput.css'
import SelectedKeyInputForm from './SelectedKeyInputForm'
import GeneralMacroKeyInputForm from './GeneralMacroKeyInputForm'
import { DollarSign, SwatchBook } from 'lucide-react'

function MacroKeyValuesInputContainer({ selectedStock, setShowMacroKeyLevelDisplay })
{
    const [showOnlySelectedForm, setShowOnlySelectedForm] = useState(true)
    const [showDailyWeeklyMonthly, setShowDailyWeeklyMonthly] = useState(0)

    return (
        <div id='LSH-MacroKeyValueInput'>

            <div>
                {showOnlySelectedForm ? <p>{selectedStock.ticker} Key Values</p> : <p>Macro Key Values</p>}

                <div className='DailyWeeklyMonthlySelectionButtons'>
                    <button className={showDailyWeeklyMonthly === 0 ? 'macroTimeFrameSelected' : ''} onClick={() => setShowDailyWeeklyMonthly(0)}>Daily</button>
                    <button className={showDailyWeeklyMonthly === 1 ? 'macroTimeFrameSelected' : ''} onClick={() => setShowDailyWeeklyMonthly(1)}>Weekly</button>
                    <button className={showDailyWeeklyMonthly === 2 ? 'macroTimeFrameSelected' : ''} onClick={() => setShowDailyWeeklyMonthly(2)}>Monthly</button>
                </div>

                <div className='flex'>
                    <button className='buttonIcon' onClick={() => setShowOnlySelectedForm(true)}><DollarSign color={showOnlySelectedForm ? 'white' : 'gray'} /></button>
                    <button className='buttonIcon' onClick={() => setShowOnlySelectedForm(false)}><SwatchBook color={showOnlySelectedForm ? 'gray' : 'white'} /></button>
                </div>
            </div>

            {showOnlySelectedForm ?
                <SelectedKeyInputForm selectedStock={selectedStock} setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} showDailyWeeklyMonthly={showDailyWeeklyMonthly} /> :
                <GeneralMacroKeyInputForm setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} />}
        </div>
    )
}

export default MacroKeyValuesInputContainer