import React from 'react'
import { Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import type { DrawerScreenProps } from '@react-navigation/drawer'
import { Link } from '@react-navigation/native'

import styles from './styles.module'
import { RootStackParamList } from '../../App'

type Props = DrawerScreenProps<RootStackParamList, 'Registration'>

export const ProfileScreen: React.FC<Props> = (props) => {
  return (
        <View style={styles.container}>
            <Text>Profile screen</Text>
            <Link to={{ screen: 'Map' }}>[ MAP ]</Link>
            <Link to={{ screen: 'List' }}>[ LIST ]</Link>
            <StatusBar style="light" hidden={false} translucent={true} />
        </View>
  )
}
