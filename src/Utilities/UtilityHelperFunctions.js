
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

export function getSimplifiedRatio(num1, num2, precision = 1)
{
  // 1. Optional: Round to handle floating point messiness
  const n1 = Math.round(num1 / precision);
  const n2 = Math.round(num2 / precision);

  // 2. Euclidean Algorithm to find Greatest Common Divisor
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  const commonDivisor = gcd(n1, n2);

  // 3. Return the simplified parts
  return {
    ratio1: n1 / commonDivisor,
    ratio2: n2 / commonDivisor,
    string: `${n1 / commonDivisor}:${n2 / commonDivisor}`
  };
}

export function processZoneString(inputString)
{
  const sections = inputString.split(/(?=X)/g);

  // 2. Map through sections and split each by spaces
  let sample = sections.map(section => section.split(" "))

  return sample.map((t) =>
  {
    return {
      ticker: t[0],
      low: t[1],
      mid: t[2],
      high: t[3],
      close: t[4],
      range: t[7],
      trend: t[8]
    }
  })


}
