import React from 'react'

function AllScoresContainer({ auditLedger })
{
    const cumulativeBASEPointsSum = auditLedger.BASE.reduce((acc, rule) => acc + (rule.pointsApplied || 0), 0);
    const cumulativeTIMEPointsSum = auditLedger.TIME.reduce((acc, rule) => acc + (rule.pointsApplied || 0), 0);
    const cumulativeSTRATEGYPointsSum = auditLedger.STRATEGY.reduce((acc, rule) => acc + (rule.pointsApplied || 0), 0);
    const cumulativePENALTIESPointsSum = auditLedger.PENALTIES.reduce((acc, rule) => acc + (rule.pointsApplied || 0), 0);


    return (
        <div>
            <div>
                <p>BASE {cumulativeBASEPointsSum}</p>
                {auditLedger.BASE.map((t, i) => <div>
                    {t.ruleName}
                </div>)}
            </div>
            <br />
            <div>
                <p>TIME {cumulativeTIMEPointsSum}</p>
                {auditLedger.TIME.map((t, i) => <div>
                    {t.ruleName}
                </div>)}
            </div>
            <br />
            <div>
                <p>STRATEGY {cumulativeSTRATEGYPointsSum}</p>
                {auditLedger.STRATEGY.map((t, i) => <div>
                    {t.ruleName}
                </div>)}
            </div>
            <br />
            <div>
                <p>PENALTIES {cumulativePENALTIESPointsSum}</p>
                {auditLedger.PENALTIES.map((t, i) => <div>
                    {t.ruleName}
                </div>)}
            </div>
        </div>
    )
}

export default AllScoresContainer