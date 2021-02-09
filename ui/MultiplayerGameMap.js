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
import TimerMixin from 'react-timer-mixin';

import * as Location from 'expo-location';

import * as geolib from 'geolib';
import {generateRandomPoint} from 'generate-random-points';

import BlinkView from 'react-native-blink-view';
import rabbitImage from './assets/whitebunny.png';
import avatar from './assets/Slice1.png';
import avatar1 from './assets/Slice2.png';
import avatar2 from './assets/Slice3.png';

import ball1 from './assets/yellowball.png';

import GoldenEgg from './assets/GoldenEgg.png';
import GreenWhiteEgg from './assets/GreenWhiteEgg.png';
import Man from './assets/Man.png';

// import avatar from './assets/source.gif';
// import avatar1 from './assets/source.gif';
// import avatar2 from './assets/source.gif';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
//const LATITUDE = 32.9482511;
//const LONGITUDE = -96.6292103;
const LATITUDE_DELTA = 0.000622;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
const CIRCLE_COLOR = 'rgba(235,120,157, 0.3)';
const PLAYER_COLOR = 'rgba(0,255,157, 1)';

const CAPTURE_DISTANCE = 50;



let id = 0;

export default class MultiplayerGameMap extends React.Component {

  
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

    // alert(this.props.initialPosition);

    //this.mixins = [TimerMixin];

    this.onRegionChange = this.onRegionChange.bind(this);
    this.handleMarkerPress = this.handleMarkerPress.bind(this);

    this.watchID = (null: ?number);

    this.state = {
       region: {
         latitude: this.props.initialPosition.coords.latitude,
         longitude: this.props.initialPosition.coords.longitude,
         latitudeDelta: this.currentLatDelta,
         longitudeDelta: this.currentLongDelta,
       },
       markers: [
         {
           coordinate: {
             latitude: this.props.initialPosition.coords.latitude,
             longitude: this.props.initialPosition.coords.longitude,
           },
         }
       ],
       polygons: [],
       editing: null,
       creatingHole: false,
      currentPosition: this.props.initialPosition,
      targetPosition: void 0,
      started: false,
      originalDistance: 0,
      lastDistance: 0,
      currentDistance: 0,
      showTarget: false,
      showMidPoint: false,
      bearing: 0,
      imageIndex: 0,
      lastMovingDistance: 0,
      cameraAlt: 1,  // IOS
      cameraPitch: 60,
      cameraHeading: 0,
      cameraZoom: 25  // Google Provider
    };
    
  }

  componentDidMount() {
    
    this.watchLocationChanges();
  }

watchLocationChanges = async () => {

    this.mlocation = Location.watchPositionAsync({
        enableHighAccuracy: true,
        timeInterval: 1,
        distanceInterval: 1
    }, (position) => {
        if (this.clearId) {
            TimerMixin.clearTimeout(this.clearId);
        }
  
        this.clearId = TimerMixin.setTimeout(
          () => {this.setState({imageIndex: 0})}, 5000);
  
        let perviousPosition = this.state.currentPosition;
        if (perviousPosition === 'unknown') {
          previousPosition = position;
        }
  
        var lastPosition = JSON.stringify(position);
        console.log("position async --------->:", position.coords);
  
        let screenCoords;
        
        // if (position && this.map) {
        //   try {
        //       screenCoords = await this.map.pointForCoordinate(position.coords);
        //       console.log("screenPoint---->>>>:", screenCoords);
        //   } catch (error) {
        //       console.log("Failed to get Screen Coordinates", error);
        //   }
        // }
  
        //this.setState({currentPosition: position});
  
        //alert('initial' + this.state.initialPosition);
        //alert('You are ' + geolib.getDistance(position.coords, this.state.initialPosition.coords) + ' meters away from original position');
  
        let distanceToTarget = 0;
        if (this.state.targetPosition) {
          distanceToTarget = geolib.getDistance(position.coords, this.state.targetPosition);
        }
  
        let bearing = this.state.bearing;
  
        let lastMove = 0;
  
        //if (this.state.currentPosition !== 'unknown') {
        // if (this.state.targetPosition) {
          console.log("currentPosition:", this.state.currentPosition);
          console.log("position:", position);
          bearing = geolib.getGreatCircleBearing(
              {latitude: this.state.currentPosition.coords.latitude, longitude: this.state.currentPosition.coords.longitude},
              {latitude: position.coords.latitude, longitude: position.coords.longitude},
          );
  
          // bearing = geolib.getBearing(
          //     {latitude: position.coords.latitude, longitude: position.coords.longitude},
          //     {latitude: this.state.targetPosition.latitude, longitude: this.state.targetPosition.longitude}
          // );
  
          lastMove = geolib.getDistance(position.coords, this.state.currentPosition.coords);
        //}
  
        let imgIndex = this.state.imageIndex;
        if (lastMove > 0) {
          if (imgIndex === 0 || imgIndex === 1) {
            imgIndex = 2;
          } else {
            imgIndex = 1;
          }
        }
  
        var markers = [];
        if (this.state.targetPosition) {
          markers = this.generateMarkers(this.state.targetPosition, position);
        } else {
          markers = [
            {
              coordinate: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            }
          ];
        }
  
        let currLatDelta = this.state.region.latitudeDelta;
        let currLongDelta = this.state.region.longitudeDelta;
  
        this.setState({currentPosition: position, markers: markers,
          lastDistance: this.state.currentDistance, currentDistance: distanceToTarget, showTarget: distanceToTarget > 0 && distanceToTarget <= CAPTURE_DISTANCE,
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: this.currentLatDelta,
            longitudeDelta: this.currentLongDelta,
          },
          bearing: 0,
          cameraHeading: bearing,
          imageIndex: imgIndex,
          lastMovingDistance: lastMove,
          screenCoords}, () => {this.setCamera()});
    });
  }

  onRegionChange = (region) => {
    this.currentLatDelta = region.latitudeDelta;
    this.currentLongDelta = region.longitudeDelta;
  }

  handleMarkerPress = (event) => {
    const markerID = event.nativeEvent.id
    console.log(markerID)
    alert('Well Done!');
  }

  componentWillUnmount() {
    //   Location.clearWatch(this.watchID);
    if (this.watchID)
        this.watchID.remove();
  }

  show = () => {
    this.marker1.showCallout();
  }

  hide = () => {
    this.marker1.hideCallout();
  }

  calcualteMidPoint(lat1, lng1, lat2, lng2) {

    //-- Longitude difference
    console.log(lat1, ",", lng1, ",", lat2, ",", lng2);
    var dLng = (lng2 - lng1).toRad();

    //-- Convert to radians
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();
    lng1 = lng1.toRad();

    var bX = Math.cos(lat2) * Math.cos(dLng);
    var bY = Math.cos(lat2) * Math.sin(dLng);
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
    var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

    //-- Return result
    return [lng3.toDeg(), lat3.toDeg()];
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

  pitchPlus = () => {
    this.setState({cameraPitch: this.state.cameraPitch + 1}, () => {this.setCamera()});
  }

  pitchMinus = () => {
    this.setState({cameraPitch: this.state.cameraPitch - 1}, () => {this.setCamera()});
  }

  headingPlus = () => {
    this.setState({cameraHeading: this.state.cameraHeading + 1}, () => {this.setCamera()});
  }

  headingMinus = () => {
    this.setState({cameraHeading: this.state.cameraHeading - 1}, () => {this.setCamera()});
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

  toggleStart() {
    if (!this.state.started) {
    //   var pos = {latitude: this.state.currentPosition.coords.latitude, longitude: this.state.currentPosition.coords.longitude};
    //   //alert(pos);
    //   var random = generateRandomPoint(pos, 10);
    //   //alert(JSON.stringify(random));

    //   let p1 = {longitude: this.state.currentPosition.coords.longitude,
    //     latitude: this.state.currentPosition.coords.latitude};
    //   let p2 = {longitude: random.longitude, latitude: random.latitude};

    //   let midPoint = this.calcualteMidPoint(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    //   //alert(midPoint);

    //   var markers = [
    //   {
    //     coordinate: {
    //       latitude: this.state.currentPosition.coords.latitude,
    //       longitude: this.state.currentPosition.coords.longitude,
    //     }
    //   },
    //   {
    //     coordinate: {
    //       latitude: random.latitude,
    //       longitude: random.longitude,
    //     }
    //   },
    //   {
    //     coordinate: {
    //       latitude: midPoint[1],
    //       longitude: midPoint[0]
    //     }
    //   }];

    //   let distanceToTarget = geolib.getDistance(this.state.currentPosition.coords, random);

    //   this.setState({targetPosition: random,
    //     markers: markers,
    //     started: !this.state.started,
    //     originalDistance: distanceToTarget,
    //     lastDistance: distanceToTarget,
    //     currentDistance: distanceToTarget,
    //     showTarget: distanceToTarget > 0 && distanceToTarget <= CAPTURE_DISTANCE});

        this.startGame();
    } else {
      var markers = [
      {
        coordinate: {
          latitude: this.state.currentPosition.coords.latitude,
          longitude: this.state.currentPosition.coords.longitude,
        }
      }]
      this.setState({targetPosition: void 0, markers: markers, started: !this.state.started});
    }
  }

  startGame = () => {
      this.props.startGame(this.state.currentPosition);
  }

  onCreateNewGame = () => {
    this.setState({
        editing: {
          id: id++,
          coordinates: [e.nativeEvent.coordinate],
          holes: [],
        },
      });
  }

  onMapPress = (e) => {
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

  renderMap = () => {
    const mapOptions = {
        scrollEnabled: true,
      };
  
      
    const { region, markers, showMidPoint, showTarget } = this.state;
    return <MapView
        {...mapOptions}
        showsCompass
        pitchEnabled
        showsBuildings
        provider={this.props.provider}
        style={styles.map}
        onRegionChange={this.onRegionChange}
        ref={ref => { this.map = ref }}
        initialCamera={{
        center: markers[0].coordinate,
        pitch: this.state.cameraPitch,
        heading: this.state.cameraHeading,
        altitude: this.state.cameraAlt,
        zoom: this.state.cameraZoom
        }}
        onLayout={async () => {
            this.map.animateCamera({
                center: markers[0].coordinate,
                pitch: this.state.cameraPitch,
                heading: this.state.cameraHeading,
                altitude: this.state.cameraAlt,
                zoom: this.state.cameraZoom
            });

        
        }}
        onPress={this.onMapPress}
    >
    
    {this.props.gameInfo && this.props.gameInfo.region && <Polygon
              key={1000}
              coordinates={this.props.gameInfo.region}
            //   holes={polygon.holes}
              strokeColor="rgba(0,0,255,0.1)"
              fillColor="rgba(0,0,255,0.1)"
              strokeWidth={1}
            />}
    {this.props.gameInfo.players && this.createPlayerMarkers()}
    <MapView.Marker
        key={1001}
        coordinate={markers[0].coordinate}
        anchor={{x: 0.5, y: 0.5}}
        image={avatar}
    ></MapView.Marker>
    {this.props.gameInfo.items && this.props.gameInfo.items.length > 0 && this.createRandomPointMarkers()}
    <MapView.Circle
        center={markers[0].coordinate}
        radius={2}
        fillColor={CIRCLE_COLOR}
        strokeWidth={1}
        strokeColor = {CIRCLE_COLOR}/>
    {/* <MapView.Marker
        ref={ref => { this.marker1 = ref; }}
        coordinate={markers[0].coordinate}
        image={avtr}
        title=""
        description=""
        rotation={this.state.bearing}
        flat={false}
        // anchor={{x: 0, y: 0}}   // For Google Maps
        centerOffset={{x: 0, y: -30}}   // For IOS
    />  */}
        {this.state.polygons.map(polygon => (
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
          )}
    </MapView>
  }

  createPlayerMarkers = () => {
      return this.props.gameInfo.players.map((player, index) => {
        if (player.playerName !== this.props.playerName) {
            return <MapView.Marker
                key={index + 100}
                coordinate={player.location}
                //anchor={{x: 10.75, y: 0.75}}
                centerOffset={{x: 0.75, y: 0.75}}
                image={avatar}
            ></MapView.Marker>
        }
      });
  }

  createRandomPointMarkers = () => {
    return this.props.gameInfo.items.map((point, index) => {
        return <MapView.Marker
            key={index + 100}
            coordinate={{longitude: point.geometry.coordinates[0], latitude: point.geometry.coordinates[1]}}
            anchor={{x: 0.5, y: 0.5}}
            image={index % 2 ? GoldenEgg: GreenWhiteEgg}
        ></MapView.Marker>
    });
  }

  render() {
    const { region, markers, showMidPoint, showTarget } = this.state;

    var mapview;

    let avtr = avatar;
    if (this.state.imageIndex === 1) {
      avtr = avatar1;
    } else if (this.state.imageIndex ===2) {
      avtr = avatar2;
    }

    if (region) {
        mapview = this.renderMap();
    }

    let progressText = <Text>Getting Closer</Text>;
    if (this.state.currentDistance > this.state.lastDistance) {
      progressText = <Text>Moving Away</Text>
    }

    let distanceBar = null;

    if (this.state.started) {
      distanceBar = <View style={styles.distanceBar}>
          <View style={styles.bubblePlaceholder}>
          </View>

          <View style={styles.bubbleDistance}>
            <Text style={styles.distanceText}>{this.state.currentDistance}</Text>
          </View>

          <BlinkView blinking={true} style={styles.bubbleRed} delay={200}>
          </BlinkView>
      </View>

      if (this.state.currentDistance > this.state.lastDistance) {
        distanceBar = <View style={styles.distanceBar}>
            <BlinkView blinking={true} style={styles.bubbleBlue} delay={200}>
            </BlinkView>

            <View style={styles.bubbleDistance}>
              <Text style={styles.distanceText}>{this.state.currentDistance}</Text>
            </View>

            <View style={styles.bubblePlaceholder}>
            </View>
        </View>
      }
    }


    let startButtonText = this.state.started ? <Text>Cancel Game</Text> : <Text>Lets Go</Text>

    

    console.log("screenCoords in render:", this.state.screenCoords);
    return (
      <View style={styles.container}>
        {mapview}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => this.toggleStart()} style={[styles.bubble, styles.button]}>
            {startButtonText}
          </TouchableOpacity>
          
        </View>

        
        {/* {this.state.screenCoords && <View 
          style={{
            width: 35,
            height: 65,
            position: 'absolute',
            left: this.state.screenCoords.x - 35/2,
            top: this.state.screenCoords.y - 60,
            zIndex: 10000,
            // borderColor: '#000',
            // borderStyle: 'solid',
            // borderWidth: 1
          }}
          >
            <Image style={{width: 35, height: 60}} source={require("./assets/test1.gif")}/>
        </View>} */}
      </View>
    );
  }
}

MultiplayerGameMap.propTypes = {
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


