import { LatLngBounds } from 'leaflet'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const MyAwesomeMap = dynamic(() => import('@/components/map'), { ssr: false })
const MyMapEvents = dynamic(() => import('@/components/map/MapEvents'), {
    ssr: false
})
const MyPoint = dynamic(() => import('@/components/map/MyPoint'), {
    ssr: false
})

const DEFAULT_CENTER = [52.580517, 56.855385]

type TLocation = {
    latitude: number
    longitude: number
}

const Page: NextPage = () => {
    const [bounds, setBounds] = useState<string>('')
    const [location, setLocation] = useState<TLocation>()

    const handleChangeBounds = (bounds: LatLngBounds) => {
        setBounds(bounds.toBBoxString())
        // console.log('Changed bounds: ', )
    }

    useEffect(() => {
        if ('geolocation' in navigator) {
            // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                const { latitude, longitude } = coords
                // @ts-ignore
                setLocation({ latitude, longitude })
            })
        }
    }, [])

    return (
        <div>
            <MyAwesomeMap
                height={300}
                width={500}
                center={
                    location
                        ? [location.latitude, location.longitude]
                        : DEFAULT_CENTER
                }
                zoom={15}
                // whenReady={(e: any) => {
                //     console.log('e', e)
                // }}
            >
                {/*@ts-ignore*/}
                {({ TileLayer }) => (
                    <>
                        <TileLayer
                            url={
                                'https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWlrc29mdCIsImEiOiJjbGFtY3d6dDkwZjA5M3lvYmxyY2kwYm5uIn0.j_wTLxCCsqAn9TJSHMvaJg'
                            }
                            attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                        />
                        {/*<TileLayer*/}
                        {/*    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'*/}
                        {/*    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'*/}
                        {/*/>*/}
                        {location && (
                            <MyPoint
                                lat={location?.latitude}
                                lon={location?.longitude}
                            />
                        )}
                        <MyMapEvents onChangeBounds={handleChangeBounds} />
                    </>
                )}
            </MyAwesomeMap>
            <div>
                My Location: {location?.latitude},{location?.longitude}
            </div>
            <div>Bounds: {bounds}</div>
        </div>
    )
}

export default Page
