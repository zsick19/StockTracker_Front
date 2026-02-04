import React, { useState } from 'react'
import './MacroKeyValuesInput.css'
import SelectedKeyInputForm from './SelectedKeyInputForm'
import GeneralMacroKeyInputForm from './GeneralMacroKeyInputForm'

function MacroKeyValuesInputContainer({ selectedStock, setShowMacroKeyLevelDisplay })
{
    const [showOnlySelectedForm, setShowOnlySelectedForm] = useState(false)

    return (
        <div id='LSH-MacroKeyValueInput'>
            <div className='flex'>
                {showOnlySelectedForm ? <h1>Macro Key Values for {selectedStock.ticker}</h1> : <p>Macro Key Values</p>}
                <button onClick={() => setShowOnlySelectedForm(prev => !prev)}>{showOnlySelectedForm ? 'All Macros' : 'Selected Macro'}</button>
            </div>
            {showOnlySelectedForm ?
                <SelectedKeyInputForm selectedStock={selectedStock} setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} /> :
                <GeneralMacroKeyInputForm setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} />
            }

        </div>
    )
}

export default MacroKeyValuesInputContainer