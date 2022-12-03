import React from 'react';
import { Provider } from 'react-redux';
import { registerRootComponent } from 'expo';

import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { store } from './api/store';

import {LocalMapScreen} from "./screens/local-map/LocalMapScreen";
import {ListPlacesScreen} from "./screens/list-places/ListPlacesScreen";
import {StatusBar} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomDrawer from "./components/custom-drawer/CustomDrawer";

export type RootStackParamList = {
    List: undefined;
    Map: undefined;
};

const Drawer = createDrawerNavigator<RootStackParamList>();

export default function App() {
    React.useEffect(() => {
        StatusBar.setHidden(true);
    });

    return (
        <Provider store={store}>
            <NavigationContainer>
                <Drawer.Navigator
                    drawerContent={props => <CustomDrawer {...props} />}
                    screenOptions={{
                        headerShown: false,
                        drawerActiveBackgroundColor: '#aa18ea',
                        drawerActiveTintColor: '#fff',
                        drawerInactiveTintColor: '#333',
                        drawerLabelStyle: {
                            marginLeft: -25,
                            fontSize: 15,
                        },
                    }}>
                    <Drawer.Screen
                        name={'List'}
                        component={ListPlacesScreen}
                        options={{
                            drawerIcon: ({color}) => (
                                <Ionicons
                                    name={'home-outline'}
                                    size={22}
                                    color={color}
                                />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name={'Map'}
                        component={LocalMapScreen}
                        options={{
                            drawerIcon: ({color}) => (
                                <Ionicons
                                    name={'person-outline'}
                                    size={22}
                                    color={color}
                                />
                            ),
                        }}
                    />
                </Drawer.Navigator>
            </NavigationContainer>
        </Provider>
    );
}

registerRootComponent(App);
