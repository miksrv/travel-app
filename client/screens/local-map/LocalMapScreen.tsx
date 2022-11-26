import React from "react";
import MapView, { Circle, Marker, LatLng, Region } from 'react-native-maps';
import { View } from 'react-native';

import * as Location from 'expo-location';
import {usePostCurrentLocationMutation} from "../../api/poiApi";

import styles from "./styles.module";

export const LocalMapScreen: React.FC = () => {
    const [defaultLocation, setDefaultLocation] = React.useState<Location.LocationObject | undefined>(undefined);
    const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject | undefined>(undefined);
    const [errorMsg, setErrorMsg] = React.useState<string>('');

    const [ postCurrentLocation, { isLoading, data } ] = usePostCurrentLocationMutation();

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

    const handleUpdate = async (region: Region) => {
        await postCurrentLocation({
            lat: region.latitude,
            lon: region.longitude,
        })
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                showsUserLocation={true}
                initialRegion={{
                    latitude: defaultLocation?.coords.latitude || 47,
                    longitude: defaultLocation?.coords.longitude || 71,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
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

                    // handleUpdate(region);
                }}
            >
                {!!data?.length && data.map((poi) => (
                    <Marker
                        key={poi.lat + poi.lon}
                        title={poi.name}
                        coordinate={{
                            latitude: poi.lat,
                            longitude: poi.lon,
                        }}
                    />
                ))}
                {currentLocation && (
                    <Circle
                        center={{
                            latitude: currentLocation.coords.latitude,
                            longitude: currentLocation.coords.longitude,
                        }}
                        radius={500}
                        strokeWidth={1}
                        strokeColor={isLoading ? 'green' : '#1a66ff'}
                        fillColor={'rgba(230,238,255,0.5)'}
                    />
                )}
            </MapView>
        </View>
    )
}
