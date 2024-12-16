import {Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Geolocation from '@react-native-community/geolocation';
import {MAPTILER_KEY} from './src/utils/key';
import ActionSheet, {ScrollView} from 'react-native-actions-sheet';
import * as turf from "@turf/turf";
import {bangaloreGeoJson} from "./src/utils/geo-location.ts";
import {LogBox} from 'react-native';

LogBox.ignoreAllLogs();
MapLibreGL.setAccessToken(null);

const styleUrl = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;

const App = () => {
    const [currentPosition, setCurrentPosition] = useState<number[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const actionSheetRef = useRef(null);

    const searchLocation = () => {
        if (searchQuery) {
            fetch(`https://api.maptiler.com/geocoding/${searchQuery}.json?key=${MAPTILER_KEY}`)
                .then(response => response.ok ? response.json() : Promise.reject(response.status))
                .then(data => data.features[0] && setCurrentPosition(data.features[0].center))
                .catch(error => console.error('Error fetching location:', error));
        }
    };

    const getUserLocation = () => {
        Geolocation.getCurrentPosition(
            ({coords: {latitude, longitude}}) => setCurrentPosition([longitude, latitude]),
            error => console.error('Error getting position:', error),
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 0}
        );
    };

    const createPolygon = () => {
        return turf.polygon(bangaloreGeoJson.features[0].geometry.coordinates);
    };

    const geoJsonData = createPolygon();

    const NavigateToPolygon = () => {
        setCurrentPosition([77.713337, 12.881258])
    }

    return (
        <View style={styles.page}>
            <View style={styles.suggestions}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search a place..."
                    placeholderTextColor="#999"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
                <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
                    <Image source={require('./static/images/search.png')} style={styles.locationIcon}/>
                </TouchableOpacity>
            </View>
            <MapLibreGL.MapView style={styles.map} styleURL={styleUrl}>
                {currentPosition && (
                    <MapLibreGL.Camera
                        zoomLevel={10}
                        pitch={50}
                        centerCoordinate={currentPosition}
                        animationMode="flyTo"
                        animationDuration={1000}
                    />
                )}
                <MapLibreGL.ShapeSource id="polygonSource" shape={geoJsonData}>
                    <MapLibreGL.FillLayer
                        id="polygonFill"
                        style={bangaloreGeoJson.style}
                    />
                </MapLibreGL.ShapeSource>
            </MapLibreGL.MapView>
            <TouchableOpacity style={styles.locationButton} onPress={getUserLocation}>
                <Image source={require('./static/images/25530.png')} style={styles.locationIcon}/>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.bottomButton} onPress={() => actionSheetRef.current.show()}>
                    <Text style={styles.buttonText}>Open Bottom Sheet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={NavigateToPolygon}>
                    <Text style={styles.buttonText}>Turf Polygon</Text>
                </TouchableOpacity>
            </View>
            <ActionSheet ref={actionSheetRef} containerStyle={styles.bottomSheet} gestureEnabled overlayColor="gray">
                <ScrollView/>
                <View style={styles.bottomCard}><Text style={styles.buttonText}>Card 1</Text></View>
                <View style={styles.bottomCard}><Text style={styles.buttonText}>Card 2</Text></View>
            </ActionSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    page: {flex: 1},
    map: {flex: 1},
    suggestions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    locationButton: {
        position: 'absolute',
        top: 70,
        left: 10,
        backgroundColor: '#df6851',
        borderRadius: 50,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    searchButton: {
        backgroundColor: '#3789cf',
        borderRadius: 50,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    locationIcon: {width: 30, height: 30, tintColor: 'white'},
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        flexDirection: 'row', // Align buttons horizontally
        justifyContent: 'space-around', // Distribute buttons evenly
        zIndex: 1,
    },
    bottomButton: {paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#df6851', borderRadius: 8},
    buttonText: {color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center'},
    bottomCard: {
        height: 80,
        padding: 20,
        borderRadius: 20,
        marginTop: 10,
        backgroundColor: '#df6851',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomSheet: {flexDirection: 'column', padding: 20, zIndex: 50},
});

export default App;
