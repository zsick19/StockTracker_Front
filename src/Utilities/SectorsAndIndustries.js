export const defaultSectors = ['Healthcare', 'Consumer Staples', 'Industrials', 'Communication Services', "Utilities", "Technology", "Financials", "Materials", "Energy", "Consumer Discretionary", "Real Estate"]

export const averageVolumeOptions = [
    { text: 'Under 50K', value: -50000, direction: 'under' },
    { text: 'Under 100K', value: -100000, direction: 'under' },
    { text: 'Under 500K', value: -500000, direction: 'under' },
    { text: 'Under 750k', value: -750000, direction: 'under' },
    { text: 'Under 1M', value: -1000000, direction: 'under' },
    { text: 'Over 50K', value: 50000, direction: 'over' },
    { text: 'Over 100K', value: 100000, direction: 'over' },
    { text: 'Over 200K', value: 200000, direction: 'over' },
    { text: 'Over 300K', value: 300000, direction: 'over' },
    { text: 'Over 400K', value: 400000, direction: 'over' },
    { text: 'Over 500K', value: 500000, direction: 'over' },
    { text: 'Over 750k', value: 750000, direction: 'over' },
    { text: 'Over 1M', value: 1000000, direction: 'over' },
    { text: 'Over 2M', value: 2000000, direction: 'over' },
]


//export const defaultSectors = ['Healthcare', 'Consumer Staples', 'Industrials', 'Communication Services', 
// "Utilities", "Technology", "Financials", "Materials", "Energy", "Consumer Discretionary", "Real Estate"]

export const sectorColors = {
    'Healthcare': 'crimson',
    'Consumer Staples': 'darkorange',
    'Industrials': 'gold',
    'Communication Services': 'lawngreen',
    "Utilities": 'teal',
    "Technology": 'deepskyblue',
    "Financials": 'royalblue',
    "Materials": 'indigo',
    "Energy": 'deeppink',
    "Consumer Discretionary": 'saddlebrown',
    "Real Estate": 'slategray'
}
export const sectorToTicker = {
    'Healthcare': 'XLV',
    'Consumer Staples': 'XLP',
    'Industrials': 'XLI',
    'Communication Services': 'XLC',
    "Utilities": 'XLU',
    "Technology": 'XLK',
    "Financials": 'XLF',
    "Materials": 'XLB',
    "Energy": 'XLE',
    "Consumer Discretionary": 'XLY',
    "Real Estate": 'XLRE'
}

export const allSectorTickers = ['XLV', 'XLP', 'XLI', 'XLC', 'XLU', 'XLK', 'XLF', "XLB", 'XLE', 'XLY', 'XLRE']