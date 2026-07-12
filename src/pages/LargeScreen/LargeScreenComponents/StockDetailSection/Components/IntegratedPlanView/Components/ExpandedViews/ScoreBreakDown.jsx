import React from 'react'
import BaseScoreCard from '../ScoreCards/BaseScoreCard'
import { AuditSectionLedgerContainer } from '../ScoreCards/AuditSectionLedgerContainer'
import { useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol } from '../../../../../../../../features/Engine/EnginePlanApiSlice'
import AllScoresContainer from '../ScoreCards/AllScoresContainer'

function ScoreBreakDown({ plan, scoreCardView, setScoreCardView })
{
    const { centralScoreProfile } = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, plan.id))
    const auditLedger = centralScoreProfile.auditLedger

    function provideCurrentScoreCardView()
    {
        switch (scoreCardView)
        {

            case 0: return <AllScoresContainer auditLedger={auditLedger} />
            case 1: return <AuditSectionLedgerContainer auditRulesArray={auditLedger.BASE} />
            case 2: return <AuditSectionLedgerContainer auditRulesArray={auditLedger.TIME} />
            case 3: return <AuditSectionLedgerContainer auditRulesArray={auditLedger.STRATEGY} />
            case 4: return <AuditSectionLedgerContainer auditRulesArray={auditLedger.PENALTIES} />
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