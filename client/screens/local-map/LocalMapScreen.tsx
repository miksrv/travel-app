import React from "react";
import MapView, { Circle, LatLng, Region } from 'react-native-maps';
import { View } from 'react-native';

import * as Location from 'expo-location';

import styles from "./styles.module";

export const LocalMapScreen: React.FC = () => {
    const [defaultLocation, setDefaultLocation] = React.useState<Location.LocationObject | undefined>(undefined);
    const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject | undefined>(undefined);
    const [errorMsg, setErrorMsg] = React.useState<string>('');

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

            await Location.watchPositionAsync({}, (location) => {
                setCurrentLocation(location);
            });
        })();
    }, []);

    return (
        <View style={styles.container}>
            {defaultLocation && (
                <MapView
                    style={styles.map}
                    showsUserLocation={true}
                    initialRegion={{
                        latitude: defaultLocation.coords.latitude,
                        longitude: defaultLocation.coords.longitude,
                        latitudeDelta: 10,
                        longitudeDelta: 10,
                    }}
                    maxZoomLevel={17}
                    minZoomLevel={10}
                    onRegionChangeComplete={(region) => {
                        const boundaries = getMapBoundaries(region);
                    }}
                >
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
            )}
        </View>
    )
}
