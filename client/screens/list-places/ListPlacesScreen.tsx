import React from "react";
import {Text, View, Button} from 'react-native';
import {StatusBar} from "expo-status-bar";
import type {DrawerScreenProps} from "@react-navigation/drawer";
import {Link} from "@react-navigation/native";

import styles from "./styles.module";
import {RootStackParamList} from "../../App";

type Props = DrawerScreenProps<RootStackParamList, 'List'>;

export const ListPlacesScreen: React.FC<Props> = (props) => {
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
