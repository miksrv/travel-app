import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        borderBottomColor: '#CCC',
        borderBottomWidth: 1,
        width: '100%',
        paddingTop: 40,
        paddingBottom: 10,
        paddingLeft: 14,
        paddingRight: 14
    },
    wrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 0
    },
    menu: {
        fontSize: 18,
        lineHeight: 40
    },
    avatar: {
        width: 30,
        height: 30
    }
});

export default styles;
