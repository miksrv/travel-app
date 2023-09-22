export const encodeQueryData = (data: any): string => {
    const ret = []
    for (let d in data) {
        if (d && data[d]) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
        }
    }

    return ret.length ? '?' + ret.join('&') : ''
}

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

export const toDegreesMinutesAndSeconds = (coordinate: number): string => {
    const absolute = Math.abs(coordinate)
    const degrees = Math.floor(absolute)
    const minutesNotTruncated = (absolute - degrees) * 60
    const minutes = Math.floor(minutesNotTruncated)
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60)

    return `${degrees}°${minutes}’${seconds}"`
}

export const convertDMS = (lat: number, lng: number): string => {
    const latitude = toDegreesMinutesAndSeconds(lat)
    const latitudeCardinal = lat >= 0 ? 'N' : 'S'

    const longitude = toDegreesMinutesAndSeconds(lng)
    const longitudeCardinal = lng >= 0 ? 'E' : 'W'

    return `${latitude}${latitudeCardinal} ${longitude}${longitudeCardinal}`
}
