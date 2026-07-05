import React from 'react';
import { useSelector } from 'react-redux';
import { useFetchEngineOpenCrossDataQuery, useFetchEngineTradeDataQuery } from '../../features/Engine/EnginePlanApiSlice';
import { differenceInSeconds } from 'date-fns';

export const TerminalTaskStatusTickerHUD = () =>
{
    // Extract parameters instantly from the global store tree
    const clockState = useSelector((state) => state.sessionClock);
    const { nyCurrentTimeStr, currentActiveProfile, nextTask, msToNextTask } = clockState;


    const isReadyForHydration = currentActiveProfile.id === 'OPEN_CROSS'
    const { isSuccess: isOpenCrossSuccess, isUninitialized, refetch } = useFetchEngineOpenCrossDataQuery(undefined, { skip: !isReadyForHydration, refetchOnMountOrArgChange: true })



    const formatCountdownString = (totalMs) =>
    {
        if (totalMs <= 0) return "00:00:00";
        const totalSeconds = Math.floor(totalMs / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs < 10 ? '0' + hrs : hrs}:${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    return (
        <div style={{ background: '#111219', padding: '16px 20px', borderRadius: '4px', border: '1px solid #222', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'rgba(0, 255, 255, 0.08)', border: '1px solid #00ffff', padding: '8px 12px', borderRadius: '3px' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>NY TIME</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#00ffff', marginTop: '2px' }}>{nyCurrentTimeStr || '00:00:00'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#6272a4', letterSpacing: '1px' }}>ACTIVE TERMINAL TASK STATUS</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '3px' }}>{currentActiveProfile.label}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{currentActiveProfile.description}</div>
                    {currentActiveProfile.label === 'Open Cross Fetch' && <div>
                        {isOpenCrossSuccess ? "Successfully Updated Open Cross" : 'Error Updating Open Cross'}
                        <button onClick={() => refetch()}>refetch</button>
                    </div>}
                </div>
            </div>
            <div style={{ background: '#090a0f', padding: '8px 15px', borderRadius: '3px', border: '1px solid #1e1f29', minWidth: '150px', textAlign: 'right' }}>
                <div style={{ fontSize: '9px', color: '#6272a4' }}>NEXT TASK: {nextTask?.time || '--:--'}</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffb86c', marginTop: '2px' }}>{formatCountdownString(msToNextTask)}</div>
                <div style={{ fontSize: '8px', color: '#555', marginTop: '3px' }}>EVENT: {nextTask?.label}</div>
            </div>
        </div>
    );
};
