import React from 'react'
import { useSelector } from 'react-redux'
import { selectAllNewsRunnersAndSort } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import SingleNewsRunner from '../../../../MacroControlSection/Components/NewsRunner/Components/SingleNewsRunner'

function AllNewsRunnerSmallDisplay()
{
    const newsRunnersSorted = useSelector((state) => selectAllNewsRunnersAndSort(state))

    return (
        <div id='RunnersList' className='hide-scrollbar'>
            {newsRunnersSorted.map((t, i) => <SingleNewsRunner key={`weGotRunnerActive${t.id}`} newsRunner={t} />)}
        </div>
    )
}

export default AllNewsRunnerSmallDisplay