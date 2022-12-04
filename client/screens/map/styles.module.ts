import { StyleSheet, Dimensions } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 50
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
    fontWeight: 'bold'
  },
  loader: {
    position: 'absolute',
    zIndex: 10,
    top: 13,
    left: 70
  }
})

export default styles
