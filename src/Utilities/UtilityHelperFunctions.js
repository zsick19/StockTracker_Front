
export function abbreviateNumber(value)
{
    const suffixes = ["", "k", "M", "B", "T"];
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3);

    if (tier === 0) { return value.toString(); }

    const suffix = suffixes[tier];
    const scale = Math.pow(1000, tier);
    const scaledValue = value / scale;

    if (scaledValue % 1 !== 0) { return scaledValue.toFixed(1) + suffix; }
    else { return scaledValue + suffix; }
}

export function marketCapToText(value)
{
    if (value < 250000000) return 'Micro-Cap'
    else if (value < 2000000000) return 'Small-Cap'
    else if (value < 10000000000) return 'Mid-Cap'
    else if (value < 200000000000) return 'Large-Cap'
    else return 'Mega-Cap'
}


export function getInsertionIndexLinear(arr, num)
{
    for (let i = 0; i < arr.length; i++) { if (arr[i] >= num) { return i; } }
    return arr.length;
}