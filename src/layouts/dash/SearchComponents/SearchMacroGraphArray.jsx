import React from 'react'
import { useSelector } from 'react-redux'
import { selectMacroTickers } from '../../../features/Engine/EnginePlanApiSlice'
import { allSectorTickers, majorMacroTickers } from '../../../Utilities/SectorsAndIndustries'
import SingleMacroGraph from './SingleMacroGraph'

function SearchMacroGraphArray({ handleNavigateClear })
{

    // const macros = useSelector((state) => selectMacroTickers(state))

    return (
        <div id='SearchMacroGraphArray'>

            <div id='MajorMacroSearch'>
                {majorMacroTickers.map((ticker, i) => <SingleMacroGraph key={`searchMacro${ticker}`} ticker={ticker} />)}
            </div>

            <div id='MinorMacroSearch'>
                {allSectorTickers.map((ticker) => < SingleMacroGraph key={`searchMacro${ticker}`} ticker={ticker} />)}
            </div>

            <div id='ProgramJumpControls'>
            <button onClick={handleNavigateClear}>Market Search</button>
            </div>
        </div>
    )
}

export default SearchMacroGraphArray