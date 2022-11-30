import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 55,
    },
    text: {
        position: 'absolute',
        zIndex: 10,
        padding: 5,
        backgroundColor: '#ff6d6d',
        color: '#FFF',
        top: 10,
        left: 10
    },
    bold: {
        fontWeight: 'bold',
    },
    loader: {
        position: 'absolute',
        zIndex: 10,
        top: 13,
        left: 70
    },

    // Callout bubble
    bubble: {
        flexDirection: 'column',
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 4,
        borderColor: '#ccc',
        borderWidth: 0,
        padding: 10,
        width: 150,
    },
    // Arrow below the bubble
    arrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#fff',
        borderWidth: 16,
        alignSelf: 'center',
        marginTop: -32,
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#007a87',
        borderWidth: 14,
        alignSelf: 'center',
        marginTop: -0.5,
        // marginBottom: -15
    },
    // Character name
    name: {
        fontSize: 16,
        marginBottom: 1,
    },
    // Character image
    image: {
        width: 200,
        height: 200,
        objectFit: 'cover'
    },
});

export default styles;
