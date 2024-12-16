import {FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Geolocation from '@react-native-community/geolocation';
import {MAPTILER_KEY} from './src/utils/key';
import ActionSheet, {ActionSheetRef, ScrollView} from "react-native-actions-sheet";

MapLibreGL.setAccessToken(null);

const styleUrl = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;

const App = () => {
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const actionSheetRef = useRef<ActionSheetRef>(null);

    const searchLocation = () => {
        if (searchQuery) {
            const url = `https://api.maptiler.com/geocoding/${searchQuery}.json?key=${MAPTILER_KEY}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.features[0]) {
                        console.log(data.features)
                        setCurrentPosition(data.features[0].center)
                    }
                })
                .catch(error => {
                    console.error('Error fetching autocomplete suggestions', error);
                });
        }
    }


    const getUserLocation = async () => {
        await Geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                setCurrentPosition([longitude, latitude]);
                setSearchQuery('')
            },
            error => {
                console.error('Error getting current position', error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 0}
        );
    };

    return (
        <View style={styles.page}>

            <View style={styles.suggestions}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search a place..."
                    onChangeText={text => setSearchQuery(text)}
                    value={searchQuery}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={searchLocation}
                >
                    <Image
                        source={require('./static/images/search.png')}
                        style={styles.locationIcon}
                    />
                </TouchableOpacity>
            </View>
            <MapLibreGL.MapView
                key={currentPosition ? `${currentPosition[0]},${currentPosition[1]}` : ''}
                style={styles.map}
                styleURL={styleUrl}
            >
                {currentPosition && (
                    <MapLibreGL.Camera
                        zoomLevel={10}
                        pitch={50}
                        centerCoordinate={currentPosition}
                        animationMode="flyTo"
                        animationDuration={1000}
                    />
                )}
            </MapLibreGL.MapView>


            <TouchableOpacity
                style={styles.locationButton}
                onPress={getUserLocation}
            >
                <Image
                    source={require('./static/images/25530.png')}
                    style={styles.locationIcon}
                />
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    activeOpacity={.9}
                    style={styles.bottomButton}
                    onPress={() => actionSheetRef.current?.show()}
                >
                    <Text style={styles.buttonText}>Open Bottom Sheet</Text>
                </TouchableOpacity>
            </View>

            <ActionSheet
                ref={actionSheetRef}
                containerStyle={styles.bottomSheet}
                gestureEnabled={true}
                overlayColor={'gray'}
            >
                <ScrollView/>
                <View style={styles.bottomCard}>
                    <Text style={styles.buttonText}>Card 1</Text>
                </View>
                <View style={styles.bottomCard}>
                    <Text style={styles.buttonText}>Card 2</Text>
                </View>
            </ActionSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    suggestions: {
        flexDirection: 'row', // Layout children horizontally
        alignItems: 'center', // Center vertically
        justifyContent: 'space-between', // Adjust spacing (optional)
        borderRadius: 8,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    searchInput: {
        height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    suggestionItem: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(147,147,147,0.52)',
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
        borderRadius: 3,
        height:35,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    locationIcon: {
        width: 30,
        height: 30,
        tintColor: 'white',
    },
    buttonContainer: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        zIndex: 1,
    },
    bottomButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#df6851',
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bottomCard: {
        height: 80,
        padding: 20,
        borderRadius: 20,
        marginTop: 10,
        backgroundColor: '#df6851',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSheet: {
        display: "flex",
        flexDirection: 'column',
        padding: 20,
        zIndex: 50
    },
});

export default App;
