import React from "react";
import { Circle, Marker, Callout, LatLng, Region } from 'react-native-maps';
import MapView from "react-native-map-clustering";
import { View, Image, Text, ActivityIndicator, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';

import * as Location from 'expo-location';
import {usePostCurrentLocationMutation, usePostMapBoundariesMutation, IRestPoiItem} from "../../api/poiApi";

import styles from "./styles.module";

import mapIcon from '../../assets/map/unknow.png';
import noImage from '../../assets/noimage.jpg';
import {RootStackParamList} from "../../App";
import type {DrawerScreenProps} from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../components/header/Header";

type Props = DrawerScreenProps<RootStackParamList, 'Map'>;

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

    const handleUpdate = async (region: [LatLng, LatLng]) => {
        await postMapBoundariesMutation({
            north: region[0].latitude,
            south: region[1].latitude,
            west: region[0].longitude,
            east: region[1].longitude
        })
    }

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
                followsUserLocation={true}
                maxZoomLevel={17}
                minZoomLevel={10}
                onRegionChangeComplete={(region) => {
                    const boundaries = getMapBoundaries(region);

                    setMapBoundaries(boundaries);
                    handleUpdate(boundaries);
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
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text>
                                        <Image
                                            style={styles.image}
                                            source={noImage}
                                        />
                                    </Text>
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
