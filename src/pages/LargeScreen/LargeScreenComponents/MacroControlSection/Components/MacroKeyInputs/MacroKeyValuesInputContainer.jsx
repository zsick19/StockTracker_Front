import React, { useState } from 'react'
import './MacroKeyValuesInput.css'
import SelectedKeyInputForm from './SelectedKeyInputForm'
import GeneralMacroKeyInputForm from './GeneralMacroKeyInputForm'

function MacroKeyValuesInputContainer({ selectedStock, setShowMacroKeyLevelDisplay })
{
    const [showOnlySelected, setShowOnlySelected] = useState(true)





    return (
        <div id='LSH-MacroKeyValueInput'>
            <p>Macro Key Values</p>
            <button onClick={() => setShowOnlySelected(prev => !prev)}>{showOnlySelected ? 'All Macros' : 'Selected Macro'}</button>
            {showOnlySelected ?
                <SelectedKeyInputForm selectedStock={selectedStock} setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} /> :
                <GeneralMacroKeyInputForm setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} />
            }

        </div>
    )
}

export default MacroKeyValuesInputContainer