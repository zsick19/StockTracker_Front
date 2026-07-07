import React from 'react';

/**
 * PRODUCTION PRESENTATION PANEL: AuditSectionLedgerContainer
 * Ingests a pre-filtered array of tracking nodes to render a high-fidelity 
 * scannable metric scorecard matching your terminal design schema.
 * 
 * @param {Array} auditRulesArray - Array of rules passed from parent: [{ name, score, type, description }]
 * @param {string} sectionTitleStr - Label header for the card container panel
 */
export const AuditSectionLedgerContainer = ({ auditRulesArray = [], sectionTitleStr }) =>
{

    // In-memory running sum accumulator to dynamically calculate the section total [INDEX]
    const cumulativeSectionPointsSum = auditRulesArray.reduce((acc, rule) => acc + (rule.score || 0), 0);

    const isNegativePointsRegime = cumulativeSectionPointsSum < 0;

    // Generate standard functional visual flags based on the parent type category string [INDEX]
    const getBadgeStyleProperties = (pointsValue) =>
    {
        if (pointsValue > 0)
        {
            return {
                background: 'rgba(80, 250, 123, 0.08)',
                color: '#50fa7b',
                border: '1px solid rgba(80, 250, 123, 0.25)',
                prefixStr: '+'
            };
        } else if (pointsValue < 0)
        {
            return {
                background: 'rgba(255, 85, 85, 0.08)',
                color: '#ff5555',
                border: '1px solid rgba(255, 85, 85, 0.25)',
                prefixStr: ''
            };
        }
        return {
            background: '#1e1f29',
            color: '#6272a4',
            border: '1px solid #333',
            prefixStr: ''
        };
    };

    const headerTheme = getBadgeStyleProperties(cumulativeSectionPointsSum);

    return (
        <div style={{ background: '#111219', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>

            {/* 📋 INTEGRATED SECTION METRIC TOTAL HEADER */}
            <div style={{ padding: '14px 20px', background: '#0e0f15', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#6272a4', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {sectionTitleStr}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', color: '#6272a4', letterSpacing: '0.5px' }}>NET REGIME IMPACT:</span>
                    <span style={{ background: headerTheme.background, color: headerTheme.color, border: headerTheme.border, fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '3px', fontFamily: 'monospace' }}>
                        {headerTheme.prefixStr}{cumulativeSectionPointsSum} PTS
                    </span>
                </div>
            </div>

            {/* 🗂️ CHRONOLOGICAL TRANS-ACTION SCORECARD LEDGER */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {auditRulesArray.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', fontSize: '11px', color: '#44475a', fontStyle: 'italic' }}>
                        ⬜ No active rule triggers or multipliers recorded inside this tracking quadrant.
                    </div>
                ) : (
                    auditRulesArray.map((rule, elementIndex) =>
                    {
                        const rowStyle = getBadgeStyleProperties(rule.score);
                        const isLastItemRow = elementIndex === auditRulesArray.length - 1;

                        return (
                            <div
                                key={`${rule.name}-${elementIndex}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px 20px',
                                    background: elementIndex % 2 === 0 ? '#141520' : '#111219',
                                    borderBottom: isLastItemRow ? 'none' : '1px solid #1a1b26',
                                    transition: 'background 0.2s ease',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {/* LEFT QUADRANT: LITERAL DESCRIPTIVE MARKERS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', paddingRight: '20px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                                        {rule.name}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.3' }}>
                                        {rule.description || 'Systemic condition verified by background server algorithms.'}
                                    </div>
                                </div>

                                {/* RIGHT QUADRANT: ANCHORED POINT BADGE */}
                                <div style={{
                                    background: rowStyle.background,
                                    color: rowStyle.color,
                                    border: rowStyle.border,
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    padding: '4px 10px',
                                    borderRadius: '2px',
                                    minWidth: '55px',
                                    textAlign: 'center'
                                }}>
                                    {rowStyle.prefixStr}{rule.score}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};
