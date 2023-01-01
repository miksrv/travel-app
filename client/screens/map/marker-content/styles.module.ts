import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    // Callout bubble
    bubble: {
        // flexDirection: 'column',
        // alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 4,
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 2,
        width: 300
    },
    // Arrow below the bubble
    arrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#fff',
        borderWidth: 17,
        alignSelf: 'center',
        marginTop: -32
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
        height: 200
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
})

export default styles
