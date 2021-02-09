import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';


import MapView, {MAP_TYPES,
    Polygon} from 'react-native-maps';

    import coneImage from './assets/cone.png';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.000622;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
const CIRCLE_COLOR = 'rgba(0,255,0, 0.2)';

const CAPTURE_DISTANCE = 50;



let id = 0;

export default class TestMap extends React.Component {

  
  constructor(props) {
    super(props);
    
  }


  renderMap = () => {
    const mapOptions = {
        scrollEnabled: true,
      };
  
      
    return <MapView
        {...mapOptions}
        showsCompass
        pitchEnabled
        showsBuildings
        provider={this.props.provider}
        style={styles.map}
        ref={ref => { this.map = ref }}
        initialCamera={{
        center: { longitude: -96.62928711622952, latitude: 32.94827612158893 },
        // pitch: this.state.cameraPitch,
        // heading: this.state.cameraHeading,
        // altitude: this.state.cameraAlt,
        // zoom: this.state.cameraZoom
        }}
        // onLayout={async () => {
        //     this.map.animateCamera({
        //         center: this.state.region,
        //         pitch: this.state.cameraPitch,
        //         heading: this.state.cameraHeading,
        //         altitude: this.state.cameraAlt,
        //         zoom: this.state.cameraZoom
        //     });

        
        // }}
        onPress={this.onMapPress}
    >
    
    <Polygon
        key={1000}
        coordinates={[ { longitude: -96.62928711622952, latitude: 32.94827612158893 },
            { longitude: -96.62919357419014, latitude: 32.94834955415681 },
            { longitude: -96.62908628582954, latitude: 32.94825980323223 },
            { longitude: -96.62918820977211, latitude: 32.94817793005226 } 
          ]}
    //   holes={polygon.holes}
        strokeColor="rgba(0,0,255,0.1)"
        fillColor="rgba(0,0,255,0.1)"
        strokeWidth={1}
    />
    <MapView.Circle
        key={1}
        center={{ longitude: -96.6292072313113, latitude: 32.94820335182235 }}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>

    <MapView.Circle
        key={2}
        center={{ longitude: -96.62917853624658, latitude: 32.94833611769974 }}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>

    <MapView.Circle
        key={3}
        center={{ longitude: -96.62925025888948, latitude: 32.94827577533551 }}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>
    <MapView.Circle
        key={4}
        center={{ longitude: -96.62920062726211, latitude: 32.94824075573225}}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>
    <MapView.Circle
        key={5}
        center={{ longitude: -96.62910661982676, latitude: 32.94826658497522}}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>

    </MapView>
  }

  

  render() {
    let mapview = this.renderMap();
    
    return (
      <View style={styles.container}>
        {mapview}
      </View>
    );
  }
}

TestMap.propTypes = {
  provider: MapView.ProviderPropType,
};

const styles = StyleSheet.create({
  customView: {
    width: 140,
    height: 100,
  },
  plainView: {
    width: 60,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    transform: [
        { rotateX: '0deg'},
    ]
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleDistance: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20
  },
  distanceText: {
    textAlign: 'center'
  },
  bubbleBlue: {
    backgroundColor: 'rgba(0,0,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    width: 40,
    height: 40
  },
  bubbleRed: {
    backgroundColor: 'rgba(255,0,0,0.5)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    width: 40,
    height: 40
  },

  bubblePlaceholder: {
    backgroundColor: 'rgba(255,0,0,0)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    width: 40,
    height: 40
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  distanceBar: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});


