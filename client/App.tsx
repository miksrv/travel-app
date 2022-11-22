import React from 'react';
import { Provider } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { store } from './api/store';

import {LocalMapScreen} from "./screens/local-map/LocalMapScreen";
import {ListPlacesScreen} from "./screens/list-places/ListPlacesScreen";
import {Text, Button, StatusBar} from "react-native";

export type RootStackParamList = {
    List: undefined;
    Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    React.useEffect(() => {
        StatusBar.setHidden(false);
    });

    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="List"
                        component={ListPlacesScreen}
                        options={{
                            headerTitle: (props) => <Text>List places</Text>,
                            headerRight: () => (
                                <Button
                                    onPress={() => alert('This is a button!')}
                                    title="Info"
                                    color="#fff"
                                />
                            ),
                        }}
                    />
                    <Stack.Screen name="Map" options={{title: 'Local Map'}} component={LocalMapScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
}
