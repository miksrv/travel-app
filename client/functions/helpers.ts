export const numberFormatter = (num: number, digits?: number) => {
    const lookup = [
        { symbol: '', value: 1 },
        { symbol: 'k', value: 1e3 },
        { symbol: 'M', value: 1e6 },
        { symbol: 'G', value: 1e9 },
        { symbol: 'T', value: 1e12 },
        { symbol: 'P', value: 1e15 },
        { symbol: 'E', value: 1e18 }
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    var item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return num >= item.value
        })
    return item
        ? (num / item.value).toFixed(digits || 1).replace(rx, '$1') +
              item.symbol
        : '0'
}
