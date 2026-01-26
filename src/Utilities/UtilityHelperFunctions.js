
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