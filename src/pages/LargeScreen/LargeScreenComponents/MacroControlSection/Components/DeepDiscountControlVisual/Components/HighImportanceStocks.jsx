import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { selectHighImportancePlanIds } from '../../../../../../../features/Engine/EnginePlanApiSlice'
import SingleHighImportant from './SingleHighImportant'

function HighImportanceStocks()
{
  const highImportanceIds = useSelector(selectHighImportancePlanIds, shallowEqual)



  return (
    <div className='hide-scrollbar'>

      {highImportanceIds.map(t => <SingleHighImportant tickerSymbol={t.tickerSymbol} planId={t.planId} />)}
    </div>
  )
}

export default HighImportanceStocks