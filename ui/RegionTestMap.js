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
    Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import mapStyle from "./mapStyle.json";

import coneImage from './assets/cone.png';

import randomPointsOnPolygon from 'random-points-on-polygon';
import * as Turf from 'turf';

import avatar from './assets/Slice1.png';
import GoldenEgg from './assets/GoldenEgg.png';
import GreenWhiteEgg from './assets/GreenWhiteEgg.png';
import Man from './assets/Man.png';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.000622;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
const CIRCLE_COLOR = 'rgba(1,25,255, 0.2)';
const CIRCLE_STROKE_COLOR = 'rgba(1,25,255, 0.2)';

const CAPTURE_DISTANCE = 50;



let id = 0;

export default class RegionTestMap extends React.Component {

  
  constructor(props) {
    super(props);

    
    

    this.currentLatDelta = LATITUDE_DELTA;
    this.currentLongDelta = LONGITUDE_DELTA;

    

    
    this.state = {
       region: {
         latitude: this.props.initialPosition.latitude,
         longitude: this.props.initialPosition.longitude,
         latitudeDelta: this.currentLatDelta,
         longitudeDelta: this.currentLongDelta,
       },

       points: [],
       randomPoints: [],
       
        // cameraAlt: 1,  // IOS
        // cameraPitch: 60,
        // cameraHeading: 0,
        // cameraZoom: 25  // Google Provider

        cameraAlt: 250,  // IOS
      cameraPitch: 0,
      cameraHeading: 0,
      cameraZoom: 250  // Android,
    };
  }
  

  setCamera = () => {
    if (this.map) {
        this.map.animateCamera({
        center: this.state.currentPosition.coords,
        pitch: this.state.cameraPitch,
        heading: this.state.cameraHeading,
        altitude: this.state.cameraAlt,
        zoom: this.state.cameraZoom
        });
    }
  }

  onMapPress = (e) => {
      console.log(e.nativeEvent.coordinate);
      let points = this.state.points;
      console.log("points:", points);
      points = points.concat(e.nativeEvent.coordinate);
      console.log(points);
      this.setState({points});
  }

  generatePoints = () => {
      return this.state.points.map((point, index) => {
        return <MapView.Marker
                key={index + 100}
                coordinate={point}
                anchor={{x: 0.5, y: 0.5}}
                image={coneImage}
            ></MapView.Marker>
      })
  }

  createRandomPointMarkers = () => {
    return this.state.randomPoints.map((point, index) => {
        return <MapView.Marker
            key={index + 100}
            coordinate={{longitude: point.geometry.coordinates[0], latitude: point.geometry.coordinates[1]}}
            anchor={{x: 0.5, y: 0.5}}
            image={index % 2 ? GoldenEgg: GreenWhiteEgg}
        ></MapView.Marker>
    });
  }

  createRandomPointMarkers_ = () => {
    return this.state.randomPoints.map((point, index) => {
        return <MapView.Circle
            key={index + 100}
            center={{longitude: point.geometry.coordinates[0], latitude: point.geometry.coordinates[1]}}
            radius={1}
            fillColor={CIRCLE_COLOR}
            strokeWidth={1}
            strokeColor = {CIRCLE_STROKE_COLOR}
        ></MapView.Circle>
    });
  }

  renderMap = () => {
      console.log("mapStyle:", mapStyle);
    const mapOptions = {
        scrollEnabled: true,
      };
    
    return <MapView
        {...mapOptions}
        showsCompass
        pitchEnabled
        showsBuildings
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        ref={ref => { this.map = ref }}
        initialCamera={{
            center: this.state.region,
            pitch: this.state.cameraPitch,
            heading: this.state.cameraHeading,
            altitude: this.state.cameraAlt,
            zoom: this.state.cameraZoom
        }}
        onLayout={async () => {
            this.map.animateCamera({
                center: this.state.region,
                pitch: this.state.cameraPitch,
                heading: this.state.cameraHeading,
                altitude: this.state.cameraAlt,
                zoom: this.state.cameraZoom
            });

        
        }}
        onPress={this.onMapPress}
    >
    
    {this.state.points.length > 0 && this.generatePoints()}
    {this.state.points.length > 0 && <Polygon
              key={1000}
              coordinates={this.state.points}
            //   holes={polygon.holes}
              strokeColor="rgba(0,0,255,0.1)"
              fillColor="rgba(0,0,255,0.1)"
              strokeWidth={1}
            />}
    {this.state.randomPoints.length > 0 && this.createRandomPointMarkers()}
    {/* <MapView.Circle
        key={1}
        center={this.state.region}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor={CIRCLE_STROKE_COLOR}/> */}

        <MapView.Marker
            key={10000}
            coordinate={this.state.region}
            anchor={{x: 0.5, y: 0.5}}
            image={Man}
        ></MapView.Marker>
        
    </MapView>
  }

  getPolygonPoints = () => {
    let arr = [];
    this.state.points.forEach(point => {
        arr.push([point.longitude, point.latitude]);
    });
    
    arr.push([this.state.points[0].longitude, this.state.points[0].latitude]);

    return arr;
  }

  finishSetup = () => {
    var polygon = Turf.polygon([this.getPolygonPoints()], { name: 'poly1' });
    var randomPoints = randomPointsOnPolygon(5, polygon);
    console.log(randomPoints);
    this.setState({randomPoints});
  }

  render() {
    let mapview = this.renderMap();
    
    return (
      <View style={styles.container}>
        {mapview}
        
        <View style={{...styles.buttonContainer, marginVertical: 40, fontSize: 12}}>
            <Text>Click on the Map to set the field's boundary</Text>
        </View>
        <View style={{...styles.buttonContainer, marginVertical: 10, fontSize: 12}}>
            {this.state.points.length > 2 && <TouchableOpacity
              onPress={() => this.finishSetup()}
              style={[styles.bubble, styles.button]}
            >
              <Text>
                Finish Setup
              </Text>
            </TouchableOpacity>}
        </View>
      </View>

        
    );
  }
}

RegionTestMap.propTypes = {
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


