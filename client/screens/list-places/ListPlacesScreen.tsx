import React from "react";
import {Text, View, Button} from 'react-native';
import {StatusBar} from "expo-status-bar";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {Link} from "@react-navigation/native";

import styles from "./styles.module";
import {RootStackParamList} from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, 'List'>;

export const ListPlacesScreen: React.FC<Props> = ({ navigation, route }) => {
    return (
        <View style={styles.container}>
            <Text>Open up App.tsx to start working on your app!</Text>
            <Link to={{ screen: 'Map' }}>
                Go to the local map
            </Link>
            <StatusBar style="light" hidden={false} translucent={true} />
        </View>
    )
};
