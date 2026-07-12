/**
 * PRODUCTION COMPILER: compileVolumeAccelerationDerivative
 * Computes the second derivative of intraday candle volume (d2V/dt2) 
 * to track real-time institutional momentum acceleration and deceleration [INDEX].
 * 
 * @param {Array} todaysLiveCandles - Array of streaming intraday regular session bars
 * @returns {Array} Flat JSON collection: [{ timeLabel: "09:36", acceleration: +4500 }]
 */
export function compileVolumeAccelerationDerivative(todaysLiveCandles)
{
    if (!todaysLiveCandles || todaysLiveCandles.length < 6) return [];

    const accelerationCoordinates = [{ timeLabel: '09:30', accelerationValue: 0 }];

    // Step through the clean regular session timeline to process the double-derivative math
    for (let i = 2; i < todaysLiveCandles.length; i++)
    {
        const timeLabel = new Date(todaysLiveCandles[i].Timestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false });

        const vCurrent = todaysLiveCandles[i].Volume || 0;
        const vPrior1 = todaysLiveCandles[i - 1].Volume || 0;
        const vPrior2 = todaysLiveCandles[i - 2].Volume || 0;

        // 📐 THE QUANT SECOND DERIVATIVE CALCULATION:
        // Velocity 1 (Current rate of change): vCurrent - vPrior1
        // Velocity 2 (Prior rate of change):   vPrior1 - vPrior2
        // Acceleration (Rate of change of velocity): Velocity 1 - Velocity 2
        const computedAcceleration = (vCurrent - vPrior1) - (vPrior1 - vPrior2);

        accelerationCoordinates.push({
            timeLabel,
            accelerationValue: Math.abs(computedAcceleration), // > 0 = Pacing Faster 🟢, < 0 = Pacing Slower 🔴            
        });
    }

    return accelerationCoordinates;
}


/**
 * PRODUCTION COMPILER: computeLaglessHullVector
 * Transforms high-frequency absolute volume acceleration arrays into a
 * smooth, lagless coordinate vector specifically calibrated for D3 charting [INDEX].
 * 
 * @param {Array} rawAbsoluteAccelerationData - Array of numbers: [61000, 24000, 11000, 23000...]
 * @param {number} targetPeriodWindow - Trailing lookup baseline constraint (Default: 9 periods)
 * @returns {Array} Pristine, noise-free floating-point numbers ready for line mapping
 */
export function computeSmoothedVector(rawAbsoluteAccelerationData, targetPeriodWindow = 9)
{
    if (!rawAbsoluteAccelerationData || rawAbsoluteAccelerationData.length < targetPeriodWindow)
    {
        return [...rawAbsoluteAccelerationData]; // Fallback to raw data if array depth is insufficient
    }

    const totalDataPoints = rawAbsoluteAccelerationData.length;

    console.log(rawAbsoluteAccelerationData)
    // Helper mathematical module to compute a localized Weighted Moving Average (WMA)
    const calculateWma = (dataSeries, lookbackLength) =>
    {
        const wmaSeriesResult = new Array(dataSeries.length).fill(0);
        const denominatorSum = (lookbackLength * (lookbackLength + 1)) / 2;

        for (let i = lookbackLength - 1; i < dataSeries.length; i++)
        {
            let runningWeightSum = 0;
            for (let weightStep = 0; weightStep < lookbackLength; weightStep++)
            {
                runningWeightSum += dataSeries[i - weightStep].accelerationValue * (lookbackLength - weightStep);
            }
            wmaSeriesResult[i] = runningWeightSum / denominatorSum;
        }
        console.log(wmaSeriesResult)
        return wmaSeriesResult;
    };

    // 📐 STEP 1: SOLVE THE DUAL-WEIGHTED ACCELERATION DIFFERENCE VECTOR
    // The Hull engine utilizes a faster half-period WMA and a standard full-period WMA
    const halfPeriodLength = Math.floor(targetPeriodWindow / 2);
    const fastWmaArray = calculateWma(rawAbsoluteAccelerationData, halfPeriodLength);
    const slowWmaArray = calculateWma(rawAbsoluteAccelerationData, targetPeriodWindow);

    const rawDeltaRawSeries = new Array(totalDataPoints).fill(0);
    for (let i = 0; i < totalDataPoints; i++)
    {
        // Core Hull Formula: 2 * FastWMA - SlowWMA (This mathematically eliminates tracking lag)
        rawDeltaRawSeries[i] = (2 * fastWmaArray[i]) - slowWmaArray[i];
    }

    // 📐 STEP 2: SMOOTH THE RE-WEIGHTED DELTACLUSTERS VIA THE SQUARE-ROOT PERIOD
    const finalSmoothingPeriodWindow = Math.floor(Math.sqrt(targetPeriodWindow));
    const finalizedHullTrendVector = calculateWma(rawDeltaRawSeries, finalSmoothingPeriodWindow);

    // Clean up empty historical warmup cells to ensure seamless D3 path joins
    for (let i = 0; i < targetPeriodWindow; i++)
    {
        if (finalizedHullTrendVector[i] === 0)
        {
            finalizedHullTrendVector[i] = rawAbsoluteAccelerationData[i].accelerationValue;
        }
    }

    return finalizedHullTrendVector;
}


/**
 * PRODUCTION COMPILER: computePolynomialBestFitVector
 * Executes a least-squares polynomial regression (Quadratic or Cubic) and 
 * solves the matrix via Gaussian elimination to return a smooth curve of best fit [INDEX].
 * 
 * @param {Array} absoluteAccelerationData - Array of numeric ticks: [61000, 24000, 42000...]
 * @param {number} degree - Polynomial order (2 = Quadratic Curve, 3 = Cubic Curve) [INDEX]
 * @returns {Array} Clean array of numeric coordinates matching your timeline length
 */
export function computePolynomialBestFitVector(absoluteAccelerationData, degree = 3)
{
    const n = absoluteAccelerationData.length;
    if (!absoluteAccelerationData || n < degree + 1) { return [...absoluteAccelerationData]; }

    const matrixSize = degree + 1;

    // 1. ALLOCATE VECTORS & INTRADAY SUM MATRICES
    const X = new Array(2 * degree + 1).fill(0);
    for (let i = 0; i < 2 * degree + 1; i++)
    {
        for (let x = 0; x < n; x++)
        {
            X[i] += Math.pow(x, i);
        }
    }

    // Build Normal Matrix equations grid [INDEX]
    const B = Array.from({ length: matrixSize }, () => new Array(matrixSize).fill(0));
    const Y = new Array(matrixSize).fill(0);

    for (let row = 0; row < matrixSize; row++)
    {
        for (let col = 0; col < matrixSize; col++)
        {
            B[row][col] = X[row + col];
        }
        for (let x = 0; x < n; x++)
        {
            Y[row] += Math.pow(x, row) * absoluteAccelerationData[x].accelerationValue;
        }
    }

    // 2. SOLVE THE MATRIX SYSTEM VIA GAUSSIAN ELIMINATION L-U DECOMPOSITION [INDEX]
    for (let i = 0; i < matrixSize; i++)
    {
        for (let k = i + 1; k < matrixSize; k++)
        {
            if (Math.abs(B[i][i]) < Math.abs(B[k][i]))
            {
                // Swap rows to prevent divide-by-zero or floating-point precision drifts
                const tempRow = B[i];
                B[i] = B[k];
                B[k] = tempRow;

                const tempY = Y[i];
                Y[i] = Y[k];
                Y[k] = tempY;
            }
        }

        // Perform forward elimination step passes
        for (let k = i + 1; k < matrixSize; k++)
        {
            const factorMultiplier = B[k][i] / B[i][i];
            for (let j = i; j < matrixSize; j++)
            {
                B[k][j] -= factorMultiplier * B[i][j];
            }
            Y[k] -= factorMultiplier * Y[i];
        }
    }

    // Back-substitution to extract the final polynomial coefficients vector [INDEX]
    const coefficients = new Array(matrixSize).fill(0);
    for (let i = matrixSize - 1; i >= 0; i--)
    {
        coefficients[i] = Y[i];
        for (let j = i + 1; j < matrixSize; j++)
        {
            coefficients[i] -= B[i][j] * coefficients[j];
        }
        coefficients[i] /= B[i][i];
    }

    // 3. GENERATE THE FINAL CURVED PLOTTING VECTOR
    const curvedBestFitVector = new Array(n);
    for (let x = 0; x < n; x++)
    {
        let calculatedValueY = 0;
        for (let i = 0; i < matrixSize; i++)
        {
            calculatedValueY += coefficients[i] * Math.pow(x, i);
        }
        // Protect chart scales by clamping any mathematical dips to an absolute zero floor
        curvedBestFitVector[x] = Math.max(0, calculatedValueY)
    }



    return curvedBestFitVector.map((t, i) => { return { timeLabel: absoluteAccelerationData[i].timeLabel, accelerationValue: t } })
}
