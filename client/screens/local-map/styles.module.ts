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
        height: Dimensions.get('window').height - 50,
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
        // flexDirection: 'column',
        // alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 4,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 2,
        width: 300,
    },
    // Arrow below the bubble
    arrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#fff',
        borderWidth: 17,
        alignSelf: 'center',
        marginTop: -32,
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#ccc',
        borderWidth: 12,
        alignSelf: 'center',
        marginTop: 0,
        marginBottom: 1.8
    },
    image: {
        width: 300,
        height: 200,
    },
    photoCount: {
        position: 'absolute',
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#ffffff',
        color: '#000',
        top: 10,
        left: 10
    }
});

export default styles;
