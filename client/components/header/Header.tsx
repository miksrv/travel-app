import React from "react";
import {ImageBackground, ScrollView, Text, TouchableOpacity, View} from "react-native";
import type {DrawerHeaderProps} from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "./styles.module";

const Header: React.FC<DrawerHeaderProps> = ({navigation}) => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.wrapper}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Text style={styles.menu}>
                        <Ionicons
                            name={'menu'}
                            size={32}
                        />
                    </Text>
                </TouchableOpacity>
                <ImageBackground
                    source={require('../../assets/images/user-profile.jpg')}
                    style={styles.avatar}
                    imageStyle={{borderRadius: 25}}
                />
            </View>
        </ScrollView>
    )
}

export default Header
