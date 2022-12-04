import React from 'react'
import { Image, Text, View } from 'react-native'
import mapIcon from '../../../assets/map/unknow.png'
import { Callout, Marker } from 'react-native-maps'
import styles from './styles.module'
import WebView from 'react-native-webview'
import { IRestPoiItem } from '../../../api/poiApi'

interface MapMarkerProps {
  poi: IRestPoiItem
}

const MapMarker: React.FC<MapMarkerProps> = (props) => {
  const { poi } = props

  return (
        <Marker
            key={poi.id}
            title={poi.name}
            coordinate={{
              latitude: Number(poi.latitude),
              longitude: Number(poi.longitude)
            }}
        >
            <Image
                source={mapIcon}
                style={{ width: 26, height: 28 }}
                resizeMode="contain"
            />
            <Callout tooltip>
                <View>
                    <View style={styles.bubble}>
                        <WebView
                            style={styles.image}
                            source={{ uri: 'https://greenexp.ru/uploads/places/1991618497/59f6b8ed8f3487d2d9679dfcc727a4bf.jpg' }}
                            resizeMode={'cover'}
                        />
                        <Text style={styles.photoCount}>{'23'}</Text>
                        <Text>{poi.name}</Text>
                    </View>
                    <View style={styles.arrowBorder} />
                    <View style={styles.arrow} />
                </View>
            </Callout>
        </Marker>
  )
}

export default MapMarker
