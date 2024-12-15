import React from 'react';
import {StyleSheet, View} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

MapLibreGL.setAccessToken(null);


const App = () => {
    return (
        <View style={styles.page}>
            <MapLibreGL.MapView
                style={styles.map}
                logoEnabled={false}
                styleURL="https://api.maptiler.com/maps/streets/style.json?key=Ilt9w8U79Cp5R3xGpszv"
            />
        </View>
    );
}

export default App;

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    map: {
        flex: 1,
        alignSelf: 'stretch',
    },
});