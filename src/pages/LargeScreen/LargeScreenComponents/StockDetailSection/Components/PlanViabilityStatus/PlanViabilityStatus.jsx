import React, { useState } from 'react'
import { useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import './PlanViabilityStatus.css'

function PlanViabilityStatus()
{
  const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery()
  console.log(data)

  const [planListToDisplay, setPlanListToDisplay] = useState(0)
  return (
    <div id='LSH-PlanViabilityStatus'>PlanViabilityStatus

    </div>
  )
}

export default PlanViabilityStatus