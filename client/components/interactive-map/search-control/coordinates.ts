import L from 'leaflet'

const reInteger = '\\d+'
const reFractional = '\\d+(?:\\.\\d+)?'
export const reSignedFractional = '-?\\d+(?:\\.\\d+)?'
export const reHemisphere = '[NWSE]'

const getLatitudeLetter = (latIsSouth: boolean) => (latIsSouth ? 'S' : 'N')

const getLongitudeLetter = (lonIsWest: boolean) => (lonIsWest ? 'W' : 'E')

const parseHemispheres = (
    h1: string,
    h2: string,
    h3: string,
    allowEmpty = false
) => {
    const isLat = (h: string) => h === 'N' || h === 'S'

    let swapLatLon = false
    let hLat, hLon
    if (h1 && h2 && !h3) {
        hLat = h1.trim()
        hLon = h2.trim()
    } else if (h1 && !h2 && h3) {
        hLat = h1.trim()
        hLon = h3.trim()
    } else if (!h1 && h2 && h3) {
        hLat = h2.trim()
        hLon = h3.trim()
    } else if (allowEmpty && !h1 && !h2 && !h3) {
        return { empty: true }
    } else {
        return { error: true }
    }
    if (isLat(hLat) === isLat(hLon)) {
        return { error: true }
    }
    if (isLat(hLon)) {
        ;[hLat, hLon] = [hLon, hLat]
        swapLatLon = true
    }
    const latIsSouth = hLat === 'S'
    const lonIsWest = hLon === 'W'
    return { latIsSouth, lonIsWest, swapLatLon }
}

export const CoordinatesD = {
    create(latDeg: any, latIsSouth: any, lonDeg: any, lonIsWest: any) {
        return {
            equalTo: function (other: any) {
                return (
                    this.latDeg === other.latDeg &&
                    this.latIsSouth === other.latIsSouth &&
                    this.lonDeg === other.lonDeg &&
                    this.lonIsWest === other.lonIsWest
                )
            },
            format: function () {
                return {
                    latitude: `${getLatitudeLetter(this.latIsSouth)} ${
                        this.latDeg
                    }°`,
                    longitude: `${getLongitudeLetter(this.lonIsWest)} ${
                        this.lonDeg
                    }°`
                }
            },
            getLatLng: function () {
                let lat = this.latDeg
                if (this.latIsSouth) {
                    lat = -lat
                }
                let lon = this.lonDeg
                if (this.lonIsWest) {
                    lon = -lon
                }
                return L.latLng(lat, lon)
            },
            isValid: function () {
                return (
                    this.latDeg >= 0 &&
                    this.latDeg <= 90 &&
                    this.lonDeg >= 0 &&
                    this.lonDeg <= 180
                )
            },
            latDeg,
            latIsSouth,
            lonDeg,
            lonIsWest
        }
    },

    fromString: function (s: string) {
        const m = s.match(this.regexp)
        if (!m) {
            return { error: true }
        }
        const [h1, d1Str, h2, d2Str, h3] = m.slice(1)
        const hemispheres = parseHemispheres(h1, h2, h3)
        if (hemispheres.error) {
            return { error: true }
        }
        let [d1, d2] = [d1Str, d2Str].map(parseFloat)
        if (hemispheres.swapLatLon) {
            ;[d1, d2] = [d2, d1]
        }
        const coord = this.create(
            d1,
            hemispheres.latIsSouth,
            d2,
            hemispheres.lonIsWest
        )
        if (coord.isValid()) {
            return {
                coordinates: [coord]
            }
        }
        return { error: true }
    },

    regexp: new RegExp(
        `^(${reHemisphere} )?(${reFractional}) (${reHemisphere} )?(${reFractional})( ${reHemisphere})?$`,
        'u'
    )
}

export const CoordinatesDM = {
    create(
        latDeg: any,
        latMin: any,
        latIsSouth: any,
        lonDeg: any,
        lonMin: any,
        lonIsWest: any
    ) {
        return {
            equalTo: function (other: any) {
                return (
                    this.latDeg === other.latDeg &&
                    this.latMin === other.latMin &&
                    this.latIsSouth === other.latIsSouth &&
                    this.lonDeg === other.lonDeg &&
                    this.lonMin === other.lonMin &&
                    this.lonIsWest === other.lonIsWest
                )
            },
            format: function () {
                return {
                    latitude: `${getLatitudeLetter(this.latIsSouth)} ${
                        this.latDeg
                    }°${this.latMin}′`,
                    longitude: `${getLongitudeLetter(this.lonIsWest)} ${
                        this.lonDeg
                    }°${this.lonMin}′`
                }
            },
            getLatLng: function () {
                let lat = this.latDeg + this.latMin / 60
                if (this.latIsSouth) {
                    lat = -lat
                }
                let lon = this.lonDeg + this.lonMin / 60
                if (this.lonIsWest) {
                    lon = -lon
                }
                return L.latLng(lat, lon)
            },
            isValid: function () {
                return (
                    this.latDeg >= 0 &&
                    this.latDeg <= 90 &&
                    this.latMin >= 0 &&
                    this.latMin < 60 &&
                    this.lonDeg >= 0 &&
                    this.lonDeg <= 180 &&
                    this.lonMin >= 0 &&
                    this.lonMin < 60 &&
                    (this.latDeg <= 89 || this.latMin === 0) &&
                    (this.lonDeg <= 179 || this.lonMin === 0)
                )
            },
            latDeg,
            latIsSouth,
            latMin,
            lonDeg,
            lonIsWest,
            lonMin
        }
    },

    fromString: function (s: string) {
        const m = s.match(CoordinatesDM.regexp)
        if (!m) {
            return { error: true }
        }
        const [h1, d1Str, m1Str, h2, d2Str, m2Str, h3] = m.slice(1)
        const hemispheres = parseHemispheres(h1, h2, h3, true)
        if (hemispheres.error) {
            return { error: true }
        }
        let [d1, m1, d2, m2] = [d1Str, m1Str, d2Str, m2Str].map(parseFloat)
        const coords = []
        if (hemispheres.empty) {
            const coord1 = CoordinatesDM.create(d1, m1, false, d2, m2, false)
            const coord2 = CoordinatesDM.create(d2, m2, false, d1, m1, false)
            if (coord1.isValid()) {
                coords.push(coord1)
            }
            if (!coord1.equalTo(coord2) && coord2.isValid()) {
                coords.push(coord2)
            }
        } else {
            if (hemispheres.swapLatLon) {
                ;[d1, m1, d2, m2] = [d2, m2, d1, m1]
            }
            const coord = CoordinatesDM.create(
                d1,
                m1,
                hemispheres.latIsSouth,
                d2,
                m2,
                hemispheres.lonIsWest
            )
            if (coord.isValid()) {
                coords.push(coord)
            }
        }
        if (coords.length > 0) {
            return { coordinates: coords }
        }
        return { error: true }
    },

    regexp: new RegExp(
        `^(${reHemisphere} )?(${reInteger}) (${reFractional}) (${reHemisphere} )?(${reInteger}) (${reFractional})( ${reHemisphere})?$`, // eslint-disable-line max-len
        'u'
    )
}

export const CoordinatesDMS = {
    create(
        latDeg: any,
        latMin: any,
        latSec: any,
        latIsSouth: any,
        lonDeg: any,
        lonMin: any,
        lonSec: any,
        lonIsWest: any
    ) {
        return {
            equalTo: function (other: any) {
                return (
                    this.latDeg === other.latDeg &&
                    this.latMin === other.latMin &&
                    this.latSec === other.latSec &&
                    this.latIsSouth === other.latIsSouth &&
                    this.lonDeg === other.lonDeg &&
                    this.lonMin === other.lonMin &&
                    this.lonSec === other.lonSec &&
                    this.lonIsWest === other.lonIsWest
                )
            },
            format: function () {
                return {
                    latitude: `${getLatitudeLetter(this.latIsSouth)} ${
                        this.latDeg
                    }°${this.latMin}′${this.latSec}″`,
                    longitude: `${getLongitudeLetter(this.lonIsWest)} ${
                        this.lonDeg
                    }°${this.lonMin}′${this.lonSec}″`
                }
            },
            getLatLng: function () {
                let lat = this.latDeg + this.latMin / 60 + this.latSec / 3600
                if (this.latIsSouth) {
                    lat = -lat
                }
                let lon = this.lonDeg + this.lonMin / 60 + this.lonSec / 3600
                if (this.lonIsWest) {
                    lon = -lon
                }
                return L.latLng(lat, lon)
            },
            isValid: function () {
                return (
                    this.latDeg >= 0 &&
                    this.latDeg <= 90 &&
                    this.latMin >= 0 &&
                    this.latMin <= 59 &&
                    this.latSec >= 0 &&
                    this.latSec < 60 &&
                    this.lonDeg >= 0 &&
                    this.lonDeg <= 180 &&
                    this.lonMin >= 0 &&
                    this.lonMin <= 59 &&
                    this.lonSec >= 0 &&
                    this.lonSec < 60 &&
                    (this.latDeg <= 89 ||
                        (this.latMin === 0 && this.latSec === 0)) &&
                    (this.lonDeg <= 179 ||
                        (this.lonMin === 0 && this.lonSec === 0))
                )
            },
            latDeg,
            latIsSouth,
            latMin,
            latSec,
            lonDeg,
            lonIsWest,
            lonMin,
            lonSec
        }
    },

    fromString: function (s: string) {
        const m = s.match(CoordinatesDMS.regexp)
        if (!m) {
            return { error: true }
        }
        const [h1, d1Str, m1Str, s1Str, h2, d2Str, m2Str, s2Str, h3] =
            m.slice(1)
        const hemispheres = parseHemispheres(h1, h2, h3, true)
        if (hemispheres.error) {
            return { error: true }
        }
        let [d1, m1, s1, d2, m2, s2] = [
            d1Str,
            m1Str,
            s1Str,
            d2Str,
            m2Str,
            s2Str
        ].map(parseFloat)
        const coords = []
        if (hemispheres.empty) {
            const coord1 = CoordinatesDMS.create(
                d1,
                m1,
                s1,
                false,
                d2,
                m2,
                s2,
                false
            )
            const coord2 = CoordinatesDMS.create(
                d2,
                m2,
                s2,
                false,
                d1,
                m1,
                s1,
                false
            )
            if (coord1.isValid()) {
                coords.push(coord1)
            }
            if (!coord1.equalTo(coord2) && coord2.isValid()) {
                coords.push(coord2)
            }
        } else {
            if (hemispheres.swapLatLon) {
                ;[d1, m1, s1, d2, m2, s2] = [d2, m2, s2, d1, m1, s1]
            }
            const coord = CoordinatesDMS.create(
                d1,
                m1,
                s1,
                hemispheres.latIsSouth,
                d2,
                m2,
                s2,
                hemispheres.lonIsWest
            )
            if (coord.isValid()) {
                coords.push(coord)
            }
        }
        if (coords.length > 0) {
            return { coordinates: coords }
        }
        return { error: true }
    },

    regexp: new RegExp(
        `^(${reHemisphere} )?(${reInteger}) (${reInteger}) (${reFractional}) (${reHemisphere} )?(${reInteger}) (${reInteger}) (${reFractional})( ${reHemisphere})?$`,
        'u'
    )
}

export const CoordinatesDSigned = {
    create(latDegSigned: any, lonDegSigned: any) {
        return {
            equalTo: function (other: any) {
                return (
                    this.latDegSigned === other.latDegSigned &&
                    this.lonDegSigned === other.lonDegSigned
                )
            },
            format: function () {
                return {
                    latitude: `${this.latDegSigned}°`,
                    longitude: `${this.lonDegSigned}°`
                }
            },
            getLatLng: function () {
                return L.latLng(this.latDegSigned, this.lonDegSigned)
            },
            isValid: function () {
                return (
                    this.latDegSigned >= -90 &&
                    this.latDegSigned <= 90 &&
                    this.lonDegSigned >= -180 &&
                    this.lonDegSigned <= 180
                )
            },
            latDegSigned,
            lonDegSigned
        }
    },

    fromString: function (s: string) {
        const m = s.match(CoordinatesDSigned.regexp)
        if (!m) {
            return { error: true }
        }
        const coords = []
        const [d1, d2] = m.slice(1).map(parseFloat)
        const coord1 = CoordinatesDSigned.create(d1, d2)
        if (coord1.isValid()) {
            coords.push(coord1)
        }
        const coord2 = CoordinatesDSigned.create(d2, d1)
        if (!coord1.equalTo(coord2)) {
            if (coord2.isValid()) {
                coords.push(coord2)
            }
        }
        if (coords.length === 0) {
            return { error: true }
        }
        return {
            coordinates: coords
        }
    },

    regexp: new RegExp(`^(${reSignedFractional}) (${reSignedFractional})$`, 'u')
}
