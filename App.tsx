import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Text,
    Image,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Geolocation from '@react-native-community/geolocation';
import {STADIA_KEY} from './src/utils/key';
import ActionSheet, {ActionSheetRef, ScrollView} from "react-native-actions-sheet";

MapLibreGL.setAccessToken(null);

const apiKey = STADIA_KEY;
const styleUrl = `https://tiles.stadiamaps.com/styles/osm_bright.json?api_key=${apiKey}`;

const App = () => {
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const actionSheetRef = useRef<ActionSheetRef>(null);

    useEffect(() => {
        // Get initial location
        Geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                setCurrentPosition([longitude, latitude]);
            },
            error => {
                console.error('Error getting current position', error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
        );
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const url = `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.features) {
                        setSuggestions(data.features);
                    }
                })
                .catch(error => {
                    console.error('Error fetching autocomplete suggestions', error);
                });
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const handlePlaceSelect = (selectedPlace: any) => {
        const {coordinates} = selectedPlace.geometry;

        if (coordinates && Array.isArray(coordinates)) {
            setCurrentPosition([coordinates[0], coordinates[1]]);
            setSuggestions([]);
            setSearchQuery('')
        } else {
            console.error("Invalid coordinates:", coordinates);
        }
    };

    const getUserLocation = async () => {
        await Geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                setCurrentPosition([longitude, latitude]);
                setSuggestions([]);
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
            <MapLibreGL.MapView
                key={currentPosition ? `${currentPosition[0]},${currentPosition[1]}` : ''}
                style={styles.map}
                styleURL={styleUrl}
            >
                {currentPosition && (
                    <MapLibreGL.Camera
                        zoomLevel={14}
                        pitch={50}
                        centerCoordinate={currentPosition}
                        animationMode="flyTo"
                        animationDuration={1000}
                    />
                )}
            </MapLibreGL.MapView>

            <View style={styles.suggestions}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search a place..."
                    onChangeText={text => setSearchQuery(text)}
                    value={searchQuery}
                />
                <FlatList
                    data={suggestions}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handlePlaceSelect(item)}
                        >
                            <Text>{item.properties.label}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.properties.id}
                />
            </View>

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
        position: 'absolute',
        top: 6,
        left: 7,
        right: 7,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
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
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    locationButton: {
        position: 'absolute',
        top: 70,
        right: 10,
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 6,
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
        paddingVertical: 15,
        paddingHorizontal: 30,
        backgroundColor: '#007bff',
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
        backgroundColor: '#6c6c6c',
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
