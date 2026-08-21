/**
 * Processes your multi-dimensional data stream to generate an automated,
 * visual-first squeeze telemetry summary object.
 * 
 * @param {Object} params
 * @param {Array} params.intervals - state.activeMonitors[ticker].historicalChartIntervals (5s data array)
 * @param {Object} params.macroProfile - { trendStatus: 'BULLISH_CROSSOVER_ACTIVE'|'BULLISH_TREND_SUSTAINED'|etc. }
 * @param {Object} params.minuteMacd - { status: 'BULL_ACCELERATION'|'BULL_MOMENTUM_FADING'|etc., alert: boolean }
 * @param {number} params.institutionalSharePercent - Institutional ownership % from your stock data pull
 * @returns {Object} Structured data visualization schema for the 350px Telemetry React Panel
 */
export function generateAdvanceSqueezeSummary(intervals, macroProfile = {}, minuteMacd = {}, institutionalSharePercent = 0)
{
  // 1. SAFEGUARD EARLY UNPOPULATED MATRIX STATES
  if (!intervals || intervals.length < 4)
  {
    return {
      status: 'QUIET',
      headline: 'Initializing Core Matrix Feed...',
      meters: { pressure: 0, velocity: 0, danger: 0 },
      floatTurnover: 0,
      quoteImbalance: 0,
      institutionalPct: institutionalSharePercent
    };
  }

  const latest = intervals[intervals.length - 1];
  const previous = intervals[intervals.length - 2];

  // Extract a smoothed 15-second block window (the last 3 intervals)
  const rollingWindow = intervals.slice(-3);
  const avgSweep = rollingWindow.reduce((acc, i) => acc + i.sweepRatio, 0) / 3;
  const avgDelta = rollingWindow.reduce((acc, i) => acc + i.aggressionDelta, 0) / 3;
  const avgLeakage = rollingWindow.reduce((acc, i) => acc + i.spreadLeakage, 0) / 3;
  const totalHidden = rollingWindow.reduce((acc, i) => acc + (i.hiddenVolume || 0), 0);

  // Extract running accumulators and current order book depth conditions
  const currentFloatTurnover = latest.floatTurnOverRatio || 0;
  const latestImbalance = latest.quoteImbalance || 0; // Ranges from -1.0 (Ask Heavy) to +1.0 (Bid Heavy)

  // 🚨 2. COMPUTE INDEPENDENT VISUAL TELEMETRY METERS (Normalized 0 to 100 Baseline)

  // METER A: BUYING PRESSURE SQUEEZE FORCE
  // Combines aggression delta, sweep ratios, and rewards massive float turnover
  const maxDeltaExpected = 1000000;
  let pressureScore = ((avgDelta / maxDeltaExpected) * 40) + (avgSweep * 40) + (Math.min(1, currentFloatTurnover) * 20);

  // Downgrade pressure immediately if order book liquidity flips heavily to the Ask side
  if (latestImbalance < -0.60) pressureScore *= 0.6;
  pressureScore = Math.min(100, Math.max(0, pressureScore));

  // METER B: ACCELERATION INVENTORY VELOCITY
  // Tracks second derivative direction (acceleration) centered around a 50% equilibrium line
  let velocityScore = 50;
  if (latest.largeVelocity > 0)
  {
    velocityScore += Math.min(50, (latest.largeVelocity / 50000) * 50);
  } else
  {
    velocityScore -= Math.min(50, (Math.abs(latest.largeVelocity) / 50000) * 50);
  }

  // Crash velocity if the 1-minute MACD flags momentum fading or histogram contraction
  if (minuteMacd.status === 'BULL_MOMENTUM_FADING') velocityScore *= 0.5;
  velocityScore = Math.min(100, Math.max(0, velocityScore));

  // METER C: RISK EXHAUSTION THREAT INDEX WITH STATIC CAP FILTER
  // Evaluates severe price breaks (Below VWAP), negative slippage damage, and hidden icebergs
  const isBelowVwap = latest.lastPrice < latest.anchoredSessionVwap;
  const isIcebergActive = latest.icebergRatio > 0.15;

  let baseDangerValue = (isBelowVwap ? 50 : 0) +
    (isIcebergActive ? 25 : 0) +
    (latest.executionSlippage < 0 ? 15 : 0) +
    (latestImbalance < -0.70 ? 10 : 0); // Extra weight for heavy Ask walls

  // Apply the institutional ownership bottleneck multiplier (Scales danger up to 1.5x max)
  const institutionalCapMultiplier = 1.0 + (institutionalSharePercent / 200);
  const dangerScore = Math.min(100, Math.round(baseDangerValue * institutionalCapMultiplier));


  // 🚨 3. PRIORITY PROFILE EVALUATION ROUTING MATRIX

  // PRIORITY 1: CRITICAL REVERSAL (INSTANT ROUTE SWITCH)
  if (isBelowVwap || latest.executionSlippage < -(latest.lastPrice * 0.03))
  {
    return {
      status: 'CRITICAL',
      headline: 'EXIT POSITION - VWAP SUPPORT BROKEN',
      meters: { pressure: Math.round(pressureScore), velocity: Math.round(velocityScore), danger: Math.round(dangerScore) },
      floatTurnover: currentFloatTurnover,
      quoteImbalance: latestImbalance,
      institutionalPct: institutionalSharePercent
    };
  }

  // PRIORITY 2: STRUCTURAL BOOK TURN / DISTRIBUTIVE CEILING (ASK WALLS & ICEBERGS)
  const isAskWallStacked = latestImbalance < -0.75;
  const isPriceStalled = Math.abs(latest.lastPrice - previous.lastPrice) < (latest.lastPrice * 0.002);

  if (isAskWallStacked && isPriceStalled && latest.largeVolume > 0)
  {
    return {
      status: 'EXHAUSTION',
      headline: '⚠️ EXHAUSTION - ASK INVENTORY OVERWHELMING',
      meters: { pressure: Math.round(pressureScore), velocity: Math.round(velocityScore), danger: Math.round(dangerScore) },
      floatTurnover: currentFloatTurnover,
      quoteImbalance: latestImbalance,
      institutionalPct: institutionalSharePercent
    };
  }

  if (latest.icebergRatio > 0.25 || totalHidden > 300000 || minuteMacd.status === 'BULL_MOMENTUM_FADING')
  {
    return {
      status: 'EXHAUSTION',
      headline: 'MOMENTUM FLATLINING AGAINST CEILING',
      meters: { pressure: Math.round(pressureScore), velocity: Math.round(velocityScore), danger: Math.round(dangerScore) },
      floatTurnover: currentFloatTurnover,
      quoteImbalance: latestImbalance,
      institutionalPct: institutionalSharePercent
    };
  }

  // PRIORITY 3: LIQUIDITY VACUUM ACTIVE (MONSTER ALL-DAY RUNNER CROSS-REFERENCE)
  if (avgSweep > 0.45 && avgLeakage > (latest.lastPrice * 0.01) && currentFloatTurnover >= 1.0)
  {
    const macroTrend = macroProfile.trendStatus;
    const isMacroBullish = macroTrend === 'BULLISH_CROSSOVER_ACTIVE' || macroTrend === 'BULLISH_TREND_SUSTAINED';

    return {
      status: 'VACUUM',
      headline: isMacroBullish ? '🔥 ALL-DAY MONSTER SQUEEZE ACTIVE' : '⚡ SHORT-TERM SCALPING VACUUM',
      meters: { pressure: Math.round(pressureScore), velocity: Math.round(velocityScore), danger: Math.round(dangerScore) },
      floatTurnover: currentFloatTurnover,
      quoteImbalance: latestImbalance,
      institutionalPct: institutionalSharePercent
    };
  }

  // PRIORITY 4: ORDINARY CONTINUATION ACTIVE
  if (avgSweep > 0.30 && avgDelta > 0 && latest.largeVolume > latest.smallVolume)
  {
    return {
      status: 'RUNNING',
      headline: 'SQUEEZE TREND PROGRESSING SECURELY',
      meters: { pressure: Math.round(pressureScore), velocity: Math.round(velocityScore), danger: Math.round(dangerScore) },
      floatTurnover: currentFloatTurnover,
      quoteImbalance: latestImbalance,
      institutionalPct: institutionalSharePercent
    };
  }

  // DEFAULT PROFILE CONSOLIDATION
  return {
    status: 'QUIET',
    headline: 'STABLE SIDEWAYS MARKET CONSOLIDATION',
    meters: { pressure: Math.round(pressureScore), velocity: Math.round(velocityScore), danger: Math.round(dangerScore) },
    floatTurnover: currentFloatTurnover,
    quoteImbalance: latestImbalance,
    institutionalPct: institutionalSharePercent
  };
}
