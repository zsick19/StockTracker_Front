import React from 'react';
import { useSelector } from 'react-redux';
import { useFetchEngineMidDayDataQuery, useFetchEngineMorningDataQuery, useFetchEngineOpenCrossDataQuery, useFetchEnginePostCloseDataQuery, useFetchEngineTradeDataQuery } from '../../features/Engine/EnginePlanApiSlice';
import { differenceInSeconds } from 'date-fns';

export const TerminalTaskStatusTickerHUD = ({ showExpandedClock, setShowExpandedClock }) =>
{
    // Extract parameters instantly from the global store tree
    const clockState = useSelector((state) => state.sessionClock);
    const { nyCurrentTimeStr, currentActiveProfile, nextTask, msToNextTask } = clockState;

    const isReadyForMorningDataPull = currentActiveProfile.id === 'MORNING_DATA_PULL'
    const isReadyForOpenCrossHydration = currentActiveProfile.id === 'OPEN_CROSS_DATA_PULL'
    const isReadyForMidDayDataPull = currentActiveProfile.id === 'MIDDAY_DATA_PULL'
    const isReadyForPostCloseDataPull = currentActiveProfile.id === 'POST_CLOSE_DATA_PULL'

    const { isSuccess: isMorningSuccess, isError: isMorningError, refetch: refetchMorning } = useFetchEngineMorningDataQuery(undefined, { skip: !isReadyForMorningDataPull, refetchOnMountOrArgChange: true })
    const { isSuccess: isOpenCrossSuccess, isError: isOpenCrossError, refetch } = useFetchEngineOpenCrossDataQuery(undefined, { skip: !isReadyForOpenCrossHydration, refetchOnMountOrArgChange: true })
    const { isSuccess: isMiddaySuccess, isError: isMiddayError, refetch: refetchMidDay } = useFetchEngineMidDayDataQuery(undefined, { skip: !isReadyForMidDayDataPull, refetchOnMountOrArgChange: true })
    const { isSuccess: isPostCloseSuccess, isError: isPostCloseError, refetch: refetchPostClose } = useFetchEnginePostCloseDataQuery(undefined, { skip: !isReadyForPostCloseDataPull, refetchOnMountOrArgChange: true })





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
        <div style={{ fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', position: 'relative', alignItems: 'center', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ background: 'rgba(0, 255, 255, 0.08)', border: '1px solid #00ffff', padding: '5px 8px', borderRadius: '3px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#00ffff', marginTop: '2px' }}>{nyCurrentTimeStr || '00:00:00'}</div>
                </div>

                <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '3px' }}>{currentActiveProfile.label}</div>

                    {isReadyForMorningDataPull && isMorningError ? <div>
                        <p>Error Pulling Morning Metrics</p>
                        <button onClick={() => refetchMorning()}>Refetch</button>
                    </div> : null}

                    {isReadyForOpenCrossHydration && isOpenCrossError ? <div>
                        <p>Error Updating Open Cross</p>
                        <button onClick={() => refetch()}>refetch</button>
                    </div> : null}

                    {isReadyForMidDayDataPull && isMiddayError ? <div>
                        <p>Error Pulling Midday Metrics</p>
                        <button onClick={() => refetchMidDay()}>Refetch</button>
                    </div> : null}

                    {isReadyForPostCloseDataPull && isPostCloseError ? <div>
                        <p>Error Pulling Post Close Metrics</p>
                        <button onClick={() => refetchPostClose()}>Refetch</button>
                    </div> : null}


                </div>
            </div >

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '5px 8px', minWidth: '150px', textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>EVENT: {nextTask?.label}</div>
                <p onClick={() => setShowExpandedClock(true)} style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffb86c', marginTop: '2px' }}>{formatCountdownString(msToNextTask)}</p>
            </div>
            {
                showExpandedClock ? <div style={{ position: 'absolute', backgroundColor: 'black', bottom: '0', left: '0', width: '100%' }}>
                    <button onClick={() => setShowExpandedClock(false)}>close</button>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '3px' }}>{currentActiveProfile.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '3px' }}>{currentActiveProfile.description}</div>

                </div> : null
            }
        </div >
    );
};
