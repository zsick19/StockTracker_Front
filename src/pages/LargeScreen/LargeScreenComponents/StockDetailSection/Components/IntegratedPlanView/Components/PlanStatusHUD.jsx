import React from 'react'

function PlanStatusHUD({ plan })
{
    const planConfig = plan.planConfig
    const yesterDayClose = planConfig.dailyCalculatedValues.PrevDailyBar.ClosePrice
    const dollarChange = (plan.mostRecentPrice - yesterDayClose)
    const currentScore = plan.centralScoreProfile.matchScorePercent
    const currentStatus = plan.centralScoreProfile.status

    return (
        <div id='PlanStatusHUD'>
            <div>
                <div className='flex'>
                    <h2>{plan.id}</h2>
                    <h2>{plan.mostRecentPrice.toFixed(2)}</h2>
                </div>
                <div className='flex'>
                    <p>{dollarChange.toFixed(3)}</p>
                    <p>{((dollarChange / yesterDayClose) * 100).toFixed(2)}%</p>
                </div>
            </div>
            <div>
                {currentScore > 50 && <p>{currentScore}</p>}
                <p>{currentStatus}</p>
            </div>
        </div>
    )
}

export default PlanStatusHUD