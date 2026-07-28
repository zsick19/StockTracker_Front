import { differenceInMinutes } from 'date-fns';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectLastCandleByTicker } from '../../../../../../../features/Engine/EnginePlanApiSlice';

export const ExecutionUrgencyHud = ({ planData, scoreData, mostRecentPrice }) =>
{
    const metadata = planData.metricConfig || {};
    const activeCandle = useSelector(state => selectLastCandleByTicker(state, planData.id))

    const currentStatus = scoreData.status


    // Evaluate if real-time 1-minute volume is spiking past your 3-day baseline [INDEX]
    const baselineOneMinVol = planData.planConfig.dailyCalculatedValues?.baselineAvgOneMinVolume || 5000;
    const isLiveVolumeClimax = activeCandle.Volume >= (baselineOneMinVol * 3.5);


    const avgWindowMinutes = metadata.absorptionWindow.averageMinutesInStrikeZone || 15.0;

    const patternConfig = planData.patternConfig
    const stopLossPrice = planData.planConfig.plan.stopLossPrice

    const priceSits = mostRecentPrice > patternConfig.channelTop ? 'Out Of Range' :
        mostRecentPrice > patternConfig.entryStrikeBuffer ? 'Above Strike' :
            mostRecentPrice > patternConfig.channelBottom ? 'Inside Strike' :
                mostRecentPrice > stopLossPrice ? 'Below Floor' : 'Below Stop'

    const priceColor = mostRecentPrice > patternConfig.channelTop ? 'Red' :
        mostRecentPrice > patternConfig.entryStrikeBuffer ? 'Yellow' :
            mostRecentPrice > patternConfig.channelBottom ? 'Green' :
                mostRecentPrice > stopLossPrice ? 'Orange' : 'Red'

    const waitOrEnter = mostRecentPrice > patternConfig.channelTop ? 'Missed Trade Do Not Enter' :
        mostRecentPrice > patternConfig.entryStrikeBuffer ? 'Wait For Better Price' :
            mostRecentPrice > patternConfig.channelBottom ? 'Inside Price Zone' :
                mostRecentPrice > stopLossPrice ? 'Caution Below Floor Above Stop' : 'Below Stop Do Not Enter'




    return (
        <div style={{ borderRadius: '4px', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>

            <div style={{ background: '#111219', border: `2px solid ${priceColor}`, borderRadius: '5px', paddingTop: '0.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} >
                    <div style={{ paddingInline: '12px' }}>
                        <div style={{ fontSize: '20px', color: `${priceColor}` }}>{avgWindowMinutes} <span style={{ fontSize: '12px' }}>MIN</span></div>
                        <div style={{ fontSize: '10px', color: '#6272a4', marginBottom: '2px' }}>ABSORPTION WINDOW</div>
                    </div>
                    <div style={{ paddingInline: '12px', borderRadius: '3px', }}>
                        <div style={{ fontSize: '20px', color: `${priceColor}` }}>
                            {priceSits}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6272a4', marginBottom: '2px' }}>RANGE POSITION</div>
                    </div>
                </div>
                <div style={{ color: `${priceColor}`, padding: '0.5rem' }}>
                    <p>{waitOrEnter}</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isLiveVolumeClimax && (
                    <p style={{
                        fontSize: '10px', background: 'rgba(0,255,255,0.1)', color: '#00ffff', borderRadius: '2px',
                        fontWeight: 'bold', animation: 'pulse 1s infinite'
                    }}>⚡ LIQUIDITY ABSORPTION BLOCK ACTIVE</p>)}
            </div>

        </div >
    );
};
