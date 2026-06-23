/**
 * Core Scalar EMA Calculator.
 */
export function calculateArrayEma(pricesArray, period)
{
    if (!pricesArray || pricesArray.length === 0) return 0;
    const k = 2 / (period + 1);
    let emaVal = pricesArray[0];
    for (let i = 1; i < pricesArray.length; i++)
    {
        emaVal = (pricesArray[i] * k) + (emaVal * (1 - k));
    }
    return parseFloat(emaVal.toFixed(2));
}
