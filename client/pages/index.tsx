import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const MyAwesomeMap = dynamic(() => import('@/components/map'), { ssr: false })

const DEFAULT_CENTER = [52.580517, 56.855385]

const Page: NextPage = () => {
    const [location, setLocation] = useState()

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
        <div style={{ height: 500, width: 500 }}>
            <MyAwesomeMap
                center={
                    location
                        ? // @ts-ignore
                          [location.latitude, location.longitude]
                        : DEFAULT_CENTER
                }
                zoom={12}
            >
                {/*@ts-ignore*/}
                {({ TileLayer, Marker, Popup }) => (
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
                        <Marker
                            position={
                                location
                                    ? // @ts-ignore
                                      [location.latitude, location.longitude]
                                    : DEFAULT_CENTER
                            }
                        >
                            <Popup>
                                A pretty CSS3 popup. <br /> Easily customizable.
                            </Popup>
                        </Marker>
                    </>
                )}
            </MyAwesomeMap>
        </div>
    )
}

export default Page
