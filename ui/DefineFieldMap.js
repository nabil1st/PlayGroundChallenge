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

export default class DefineFieldMap extends React.Component {

  
  constructor(props) {
    super(props);

    
    if (typeof(Number.prototype.toRad) === "undefined") {
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      }
    }

    if (typeof(Number.prototype.toDeg) === "undefined") {
      Number.prototype.toDeg = function() {
        return this * 180 / Math.PI;
      }
    }

    this.currentLatDelta = LATITUDE_DELTA;
    this.currentLongDelta = LONGITUDE_DELTA;

    

    
    this.state = {
       region: {
         latitude: this.props.initialPosition.coords.latitude,
         longitude: this.props.initialPosition.coords.longitude,
         latitudeDelta: this.currentLatDelta,
         longitudeDelta: this.currentLongDelta,
       },

       points: [],
       
        cameraAlt: 250,  // IOS
        cameraPitch: 0,
        cameraHeading: 0,
        cameraZoom: 250  // Android
    };
    
  }

  

  finish = () => {
    const { polygons, editing } = this.state;
    this.setState({
      polygons: [...polygons, editing],
      editing: null,
      creatingHole: false,
    });
  }

  createHole = () => {
    const { editing, creatingHole } = this.state;
    if (!creatingHole) {
      this.setState({
        creatingHole: true,
        editing: {
          ...editing,
          holes: [...editing.holes, []],
        },
      });
    } else {
      const holes = [...editing.holes];
      if (holes[holes.length - 1].length === 0) {
        holes.pop();
        this.setState({
          editing: {
            ...editing,
            holes,
          },
        });
      }
      this.setState({ creatingHole: false });
    }
  }

  setCamera = () => {
    if (this.map) {
        this.map.animateCamera({
        center: this.state.currentPosition.coords,
        pitch: this.state.cameraPitch,
        heading: this.state.cameraHeading,
        altitude: this.cameraAlt,
        zoom: this.cameraZoom
        });
    }
  }


  generateMarkers(targetPosition, position) {
    var markers = [];
    if (targetPosition) {

      let p1 = {longitude: this.state.currentPosition.coords.longitude,
        latitude: this.state.currentPosition.coords.latitude};
      let p2 = {longitude: targetPosition.longitude, latitude: targetPosition.latitude};

      let midPoint = this.calcualteMidPoint(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
      markers = [
        {
          coordinate: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        },
        {
          coordinate: {
            latitude: targetPosition.latitude,
            longitude: targetPosition.longitude,
          },
        },
        {
          coordinate: {
            latitude: midPoint[1],
            longitude: midPoint[0]
          }
        }
      ];
    }

    return markers;
  }

  onMapPress = (e) => {
      console.log(e.nativeEvent.coordinate);
      let points = this.state.points;
      console.log("points:", points);
      points = points.concat(e.nativeEvent.coordinate);
      console.log(points);
      this.setState({points});
  }

  onMapPress_ = (e) => {
    const { editing, creatingHole } = this.state;
    if (!editing) {
      this.setState({
        editing: {
          id: id++,
          coordinates: [e.nativeEvent.coordinate],
          holes: [],
        },
      });
    } else if (!creatingHole) {
      this.setState({
        editing: {
          ...editing,
          coordinates: [...editing.coordinates, e.nativeEvent.coordinate],
        },
      });
    } else {
      const holes = [...editing.holes];
      holes[holes.length - 1] = [
        ...holes[holes.length - 1],
        e.nativeEvent.coordinate,
      ];
      this.setState({
        editing: {
          ...editing,
          id: id++, // keep incrementing id to trigger display refresh
          coordinates: [...editing.coordinates],
          holes,
        },
      });
    }
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

  renderMap = () => {
    const mapOptions = {
        scrollEnabled: true,
      };
  
      if (this.state.editing) {
        mapOptions.scrollEnabled = false;
        mapOptions.onPanDrag = e => this.onMapPress(e);
      }
    const { region, markers, showMidPoint, showTarget } = this.state;
    return <MapView
        {...mapOptions}
        showsCompass
        pitchEnabled
        showsBuildings
        provider={this.props.provider}
        style={styles.map}
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
    <MapView.Circle
        key={1}
        center={this.state.region}
        radius={1}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>
    
        {/* {this.state.polygons.map(polygon => (
            <Polygon
              key={polygon.id}
              coordinates={polygon.coordinates}
              holes={polygon.holes}
              strokeColor="#F00"
              fillColor="rgba(255,0,0,0.5)"
              strokeWidth={1}
            />
          ))}
          {this.state.editing && (
            <Polygon
              key={this.state.editing.id}
              coordinates={this.state.editing.coordinates}
              holes={this.state.editing.holes}
              strokeColor="#000"
              fillColor="rgba(255,0,0,0.5)"
              strokeWidth={1}
            />
          )} */}
    </MapView>
  }

  finishSetup = () => {
    this.props.setRegion(this.state.points);
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

        <View style={styles.buttonContainer}>
          {this.state.editing && (
            <TouchableOpacity
              onPress={() => this.createHole()}
              style={[styles.bubble, styles.button]}
            >
              <Text>
                {this.state.creatingHole ? 'Finish Hole' : 'Create Hole'}
              </Text>
            </TouchableOpacity>
          )}
          {this.state.editing && (
            <TouchableOpacity
              onPress={() => this.finish()}
              style={[styles.bubble, styles.button]}
            >
              <Text>Finish</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

DefineFieldMap.propTypes = {
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


