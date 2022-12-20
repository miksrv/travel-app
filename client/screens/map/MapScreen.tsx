import React from 'react'
import {Circle, LatLng, Marker, Region} from 'react-native-maps'
import MapView from 'react-native-map-clustering'
import {View, Text, ActivityIndicator, Image} from 'react-native'
import * as Location from 'expo-location'
import {
    usePostCurrentLocationMutation,
    usePostMapBoundariesMutation,
    IRestPoiItem,
    useGetPoiByIdMutation
} from '../../api/poiApi'

import styles from './styles.module'

import { RootStackParamList } from '../../App'
import type { DrawerScreenProps } from '@react-navigation/drawer'
import { debounce } from 'lodash'
import MarkerContent from './marker-content/MarkerContent'
import stylesMap from "./stylesMap.module";

type Props = DrawerScreenProps<RootStackParamList, 'Map'>

export const MapScreen: React.FC<Props> = ({ navigation }) => {
    const [defaultLocation, setDefaultLocation] = React.useState<Location.LocationObject | undefined>(undefined)
    const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject | undefined>(undefined)
    const [mapBoundaries, setMapBoundaries] = React.useState<[LatLng, LatLng] | undefined>(undefined)
    const [errorMsg, setErrorMsg] = React.useState<string>('')

    const [postCurrentLocation, { isLoading, data, isError }] = usePostCurrentLocationMutation()
    const [postMapBoundariesMutation, { data: poi, isLoading: poiLoader }] = usePostMapBoundariesMutation()
    const [getPointById, { isLoading: load1, data: data1 }] = useGetPoiByIdMutation()

    const [poiList, setPoiList] = React.useState<IRestPoiItem[]>([])

    const getMapBoundaries = (region: Region): [LatLng, LatLng] => {
        const northEast = {
            latitude: region.latitude + region.latitudeDelta / 2,
            longitude: region.longitude + region.longitudeDelta / 2
        }
        const southWest = {
            latitude: region.latitude - region.latitudeDelta / 2,
            longitude: region.longitude - region.longitudeDelta / 2
        }

        return [northEast, southWest]
    }

    React.useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied')
                return
            }

            const location = await Location.getCurrentPositionAsync({})

            setDefaultLocation(location)

            await Location.watchPositionAsync({}, async (location) => {
                setCurrentLocation(location)

                await postCurrentLocation({
                    lat: location.coords.latitude,
                    lon: location.coords.longitude
                })
            })
        })()
    }, [])

    const locationPoi: IRestPoiItem[] = React.useMemo(() =>
            data?.filter(({ id }) => poiList.find((p) => p.id === id) == null) || [],
        [data, poiList]
    )

    const boundaryPoi: IRestPoiItem[] = React.useMemo(() =>
            poi?.filter(({ id }) => poiList.find((p) => p.id === id) == null) || [],
        [poi, poiList]
    )

    React.useEffect(() => {
        setPoiList([
            ...poiList.filter(({ latitude, longitude }) =>
                (mapBoundaries != null) &&
                latitude <= mapBoundaries[0].latitude &&
                latitude >= mapBoundaries[1].latitude &&
                longitude <= mapBoundaries[0].longitude &&
                longitude >= mapBoundaries[1].longitude
            ),
            ...locationPoi,
            ...boundaryPoi
        ])
    }, [data, poi, mapBoundaries])

    const getPoiList = React.useCallback(
        debounce(async (region: [LatLng, LatLng]) => {
            await postMapBoundariesMutation({
                north: region[0].latitude,
                south: region[1].latitude,
                west: region[0].longitude,
                east: region[1].longitude
            })
        }, 1000), []
    )

    return (
        <View style={styles.container}>
            {/* <Header navigation={navigation} /> */}
            <Text style={styles.text}>
                {'POI: '}
                <Text style={styles.bold}>{poiList.length}</Text>
            </Text>
            <ActivityIndicator
                animating={isLoading || poiLoader}
                size={'small'}
                color={'#0000ff'}
                style={styles.loader}
            />
            <MapView
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    latitude: defaultLocation?.coords.latitude || 47,
                    longitude: defaultLocation?.coords.longitude || 71,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121
                }}
                camera={{
                    // altitude: 100,
                    center: {
                        latitude: defaultLocation?.coords.latitude || 47,
                        longitude: defaultLocation?.coords.longitude || 71
                    },
                    heading: 0, // Азимут
                    pitch: 0, // Наклон карты
                    zoom: 15
                }}
                customMapStyle={stylesMap}
                followsUserLocation={true}
                maxZoomLevel={17}
                minZoomLevel={10}
                onRegionChangeComplete={(region) => {
                    const boundaries = getMapBoundaries(region)

                    setMapBoundaries(boundaries)
                    getPoiList(boundaries)
                }}
            >
                {!!poiList?.length && poiList.map((item) => (
                    <Marker
                        key={item.id}
                        title={item.name}
                        coordinate={{
                            latitude: Number(item.latitude),
                            longitude: Number(item.longitude)
                        }}
                        onPress={async (event) => {
                            await getPointById(item.id)
                        }}
                    >
                        <MarkerContent poi={item} isLoading={load1} data={data1} />
                    </Marker>
                ))}
                {(currentLocation != null) && (
                    <Circle
                        center={{
                            latitude: currentLocation.coords.latitude,
                            longitude: currentLocation.coords.longitude
                        }}
                        radius={500}
                        strokeWidth={1}
                        strokeColor={'#1a66ff'}
                        fillColor={'rgba(230,238,255,0.5)'}
                    />
                )}
            </MapView>
        </View>
    )
}
