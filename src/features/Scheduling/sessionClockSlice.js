import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { isWeekend } from 'date-fns';

// =============================================================================
// ⏱️ THE ABSOLUTE CENTRAL TIMELINE CONFIGURATION
// =============================================================================
const TIMELINE_EVENTS = [
    { id: 'PRE_FLIGHT', time: '09:22', label: 'Pre-Flight Hydration', description: 'Ingesting morning CSV metadata arrays & Alpaca options chains.' },
    { id: 'DAILY_MACRO', time: '09:26', label: 'Macro Ticker Hydration', description: 'Input daily SPY values and core expected moves.' },
    { id: 'OPEN_CROSS', time: '09:34', label: 'Frontend Ingestion Wave', description: 'RTK Query fetching optimized pre-compiled opening cross watchlist data.' },
    { id: 'PRIME_SWEET', time: '09:35', label: 'Prime Execution Window', description: 'Opening bell cool-down safety gates unlocked. Live volume climax tracking active.' },

    { id: 'MIDDAY_CHURN', time: '11:30', label: 'Midday Churn Monitoring', description: 'Evaluating live midday density ratios to flag un-sponsored retail traps.' },
    { id: 'POWER_HOUR', time: '15:00', label: 'Power Hour Reconnaissance', description: 'Final options pinning and gamma acceleration pressure matrix adjustments.' },
    { id: 'LAST_FIVE_MIN', time: '15:55', label: 'Institutional Closing Influx', description: 'Intense final minutes of the trading day.' },
    { id: 'MARKET_CLOSED', time: '16:00', label: 'Post Market Breakdown', description: 'Hopefully it was a green day.' }
];

const initialState = {
    nyCurrentTimeStr: '',
    activeTaskId: 'MARKET_CLOSED',
    currentActiveProfile: { label: 'Market Closed Standby', description: 'System loops idling. Awaiting morning pre-flight triggers.' },
    nextTask: { id: 'PRE_FLIGHT', time: '09:25', label: 'Pre-Flight Hydration' },
    msToNextTask: 0
};

// =============================================================================
// ⚡ THE BACKGROUND TICKER THUNK (SINGLE HANDSHAKE WIRE)
// =============================================================================
let masterClockIntervalId = null;

export const startBackgroundSessionTicker = createAsyncThunk(
    'sessionClock/startTicker',
    async (_, { dispatch }) =>
    {
        // Prevent stacking duplicate interval loops in background memory
        if (masterClockIntervalId) clearInterval(masterClockIntervalId);

        const executeClockTickPass = () =>
        {
            const now = new Date();
            // Translate local machine browser time directly to strict New York Execution Hours
            const nyString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
            const nyDate = new Date(nyString);

            const currentHour = nyDate.getHours();
            const currentMin = nyDate.getMinutes();
            const currentTotalMinutes = currentHour * 60 + currentMin;

            let activeTask = null;
            let upcomingTask = null;

            // Map and resolve our chronological target fences
            for (let i = 0; i < TIMELINE_EVENTS.length; i++)
            {
                const task = TIMELINE_EVENTS[i];
                const [taskHour, taskMin] = task.time.split(':').map(Number);
                const taskTotalMinutes = taskHour * 60 + taskMin;

                if (currentTotalMinutes >= taskTotalMinutes) { activeTask = task; }
                else if (!upcomingTask) { upcomingTask = task; }
            }

            // Fallbacks for early off-hours sessions
            if (!activeTask)
            {
                activeTask = { id: 'MARKET_CLOSED', label: 'Market Closed Standby', description: 'System loops idling. Awaiting morning pre-flight triggers.' };
                upcomingTask = TIMELINE_EVENTS[0];
            }
            if (!upcomingTask)
            {
                upcomingTask = { id: 'CLOSE_RESET', time: '08:30', label: 'Pre-Flight Hydration (Tomorrow)' };
            }

            // Calculate countdown milliseconds to next checkpoint fence
            const target = new Date(nyDate);
            const [h, m] = upcomingTask.time.split(':').map(Number);
            target.setHours(h, m, 0, 0);
            let msDelta = target.getTime() - nyDate.getTime();
            if (msDelta < 0) msDelta += 24 * 60 * 60 * 1000;

            // Dispatch atomic payload packet straight to store slice state
            dispatch(sessionClockSlice.actions.updateSessionTime({
                wallClockTimeStr: nyDate.toLocaleTimeString("en-US", { hour12: false }),
                activeTaskId: activeTask.id,
                currentActiveProfile: activeTask,
                nextTask: upcomingTask,
                msToNextTask: msDelta
            }));
        };

        if (!isWeekend(new Date()))
        {
            executeClockTickPass();
            masterClockIntervalId = setInterval(executeClockTickPass, 1000);
        }
    }
);

export const sessionClockSlice = createSlice({
    name: 'sessionClock',
    initialState,
    reducers: {
        updateSessionTime: (state, action) =>
        {
            state.nyCurrentTimeStr = action.payload.wallClockTimeStr;
            state.activeTaskId = action.payload.activeTaskId;
            state.currentActiveProfile = action.payload.currentActiveProfile;
            state.nextTask = action.payload.nextTask;
            state.msToNextTask = action.payload.msToNextTask;
        }
    }
});

export default sessionClockSlice.reducer;
