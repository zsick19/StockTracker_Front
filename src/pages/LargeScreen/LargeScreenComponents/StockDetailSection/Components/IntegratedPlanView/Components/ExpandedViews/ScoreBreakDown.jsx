import React from 'react'
import BaseScoreCard from '../ScoreCards/BaseScoreCard'

function ScoreBreakDown({ plan, scoreCardView, setScoreCardView })
{
    const auditLedger = plan.centralScoreProfile.auditLedger

    function provideCurrentScoreCardView()
    {
        switch (scoreCardView)
        {

            case 0: return <div>overall score</div>
            case 1: return <BaseScoreCard baseScoreDetail={auditLedger.BASE} />
            case 2: return <BaseScoreCard baseScoreDetail={auditLedger.TIME} />
            // case 2: return <div>Time</div>
            case 3: return <div>Strategy</div>
            case 4: return <div>Penalties</div>
        }
    }

    return (
        <div id='ScoreCardVisual'>
            {provideCurrentScoreCardView()}
            <div>
                <button onClick={() => setScoreCardView(0)}>Over All</button>
                <button onClick={() => setScoreCardView(1)}>Base Score</button>
                <button onClick={() => setScoreCardView(2)}>Time Score</button>
                <button onClick={() => setScoreCardView(3)}>Strategy Score</button>
                <button onClick={() => setScoreCardView(4)}>Penalties</button>
            </div>
        </div>
    )
}

export default ScoreBreakDown