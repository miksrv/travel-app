import React from "react";
import { Circle, Marker, Callout, LatLng, Region } from 'react-native-maps';
import MapView from "react-native-map-clustering";
import { View, Image, Text, ActivityIndicator} from 'react-native';
import * as Location from 'expo-location';
import WebView from "react-native-webview";
import {usePostCurrentLocationMutation, usePostMapBoundariesMutation, IRestPoiItem} from "../../api/poiApi";

import styles from "./styles.module";

import mapIcon from '../../assets/map/unknow.png';
import {RootStackParamList} from "../../App";
import type {DrawerScreenProps} from "@react-navigation/drawer";
import {debounce} from "lodash";

type Props = DrawerScreenProps<RootStackParamList, 'Map'>;

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#523735"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c9b2a6"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#dcd2be"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ae9e90"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "weight": 1
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#93817c"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a5b076"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#447530"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fdfcf8"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f8c967"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#e9bc62"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e98d58"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#db8555"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#806b63"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8f7d77"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#b9d3c2"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#92998d"
            }
        ]
    }
];

export const LocalMapScreen: React.FC<Props> = ({navigation}) => {
    const [defaultLocation, setDefaultLocation] = React.useState<Location.LocationObject | undefined>(undefined);
    const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject | undefined>(undefined);
    const [mapBoundaries, setMapBoundaries] = React.useState<[LatLng, LatLng] | undefined>(undefined);
    const [errorMsg, setErrorMsg] = React.useState<string>('');

    const [ postCurrentLocation, { isLoading, data, isError } ] = usePostCurrentLocationMutation();
    const [ postMapBoundariesMutation, { data: poi, isLoading: poiLoader } ] = usePostMapBoundariesMutation();

    const [ poiList, setPoiList ] = React.useState<IRestPoiItem[]>([]);

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
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});

            setDefaultLocation(location);

            await Location.watchPositionAsync({}, async (location) => {
                setCurrentLocation(location);

                await postCurrentLocation({
                    lat: location.coords.latitude,
                    lon: location.coords.longitude,
                })
            });
        })();
    }, []);

    React.useEffect(() => {
        setPoiList([
            ...poiList.filter(({latitude, longitude}) =>
                mapBoundaries &&
                latitude <= mapBoundaries[0].latitude &&
                latitude >= mapBoundaries[1].latitude &&
                longitude <= mapBoundaries[0].longitude &&
                longitude >= mapBoundaries[1].longitude
            ),
            ...data?.filter(({id}) => !poiList.find((p) => p.id === id)) || [],
            ...poi?.filter(({id}) => !poiList.find((p) => p.id === id)) || [],
        ]);
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
            {/*<Header navigation={navigation} />*/}
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
                    longitudeDelta: 0.0121,
                }}
                camera={{
                    // altitude: 100,
                    center: {
                        latitude: defaultLocation?.coords.latitude || 47,
                        longitude: defaultLocation?.coords.longitude || 71,
                    },
                    heading: 0, // Азимут
                    pitch: 0, // Наклон карты
                    zoom: 15
                }}
                customMapStyle={mapStyle}
                followsUserLocation={true}
                maxZoomLevel={17}
                minZoomLevel={10}
                onRegionChangeComplete={(region) => {
                    const boundaries = getMapBoundaries(region);

                    setMapBoundaries(boundaries);
                    getPoiList(boundaries);
                }}
            >
                {!!poiList?.length && poiList.map((item) => (
                    <Marker
                        key={item.id}
                        title={item.name}
                        coordinate={{
                            latitude: Number(item.latitude),
                            longitude: Number(item.longitude),
                        }}
                    >
                        <Image
                            source={mapIcon}
                            style={{width: 26, height: 28}}
                            resizeMode="contain"
                        />
                        <Callout tooltip>
                            <View>
                                <View style={styles.bubble}>
                                    <WebView
                                        style={styles.image}
                                        source={{uri: 'https://greenexp.ru/uploads/places/1991618497/59f6b8ed8f3487d2d9679dfcc727a4bf.jpg'}}
                                        resizeMode={'cover'}
                                    />
                                    <Text style={styles.photoCount}>{'23'}</Text>
                                    <Text>{item.name}</Text>
                                </View>
                                <View style={styles.arrowBorder} />
                                <View style={styles.arrow} />
                            </View>
                        </Callout>
                    </Marker>
                ))}
                {currentLocation && (
                    <Circle
                        center={{
                            latitude: currentLocation.coords.latitude,
                            longitude: currentLocation.coords.longitude,
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
