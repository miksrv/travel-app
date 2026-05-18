export interface MapPoint {
    lat: number
    lon: number
}

interface MapView {
    center: [number, number]
    zoom: number
}

const DEFAULT_VIEW: MapView = { center: [55.751244, 37.618423], zoom: 5 }

export const computeMapView = (points: MapPoint[]): MapView => {
    const valid = points.filter((p) => p.lat != null && p.lon != null)

    if (!valid.length) {
        return DEFAULT_VIEW
    }

    if (valid.length === 1) {
        return { center: [valid[0].lat, valid[0].lon], zoom: 13 }
    }

    const lats = valid.map((p) => p.lat)
    const lons = valid.map((p) => p.lon)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    const center: [number, number] = [(minLat + maxLat) / 2, (minLon + maxLon) / 2]
    const span = Math.max(maxLat - minLat, maxLon - minLon)

    const zoom =
        span < 0.01
            ? 14
            : span < 0.05
              ? 13
              : span < 0.1
                ? 12
                : span < 0.5
                  ? 11
                  : span < 1
                    ? 10
                    : span < 3
                      ? 9
                      : span < 5
                        ? 8
                        : span < 10
                          ? 7
                          : span < 20
                            ? 6
                            : 5

    return { center, zoom }
}
