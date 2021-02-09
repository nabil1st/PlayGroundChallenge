import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';


import MapView from 'react-native-maps';
import TimerMixin from 'react-timer-mixin';

import * as geolib from 'geolib';
import {generateRandomPoint} from 'generate-random-points';

import BlinkView from 'react-native-blink-view';
import rabbitImage from './assets/whitebunny.png';
import avatar from './assets/Slice1.png';
import avatar1 from './assets/Slice2.png';
import avatar2 from './assets/Slice3.png';

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
const CIRCLE_COLOR = 'rgba(235,255,157, 0.3)';

const CAPTURE_DISTANCE = 50;

export default class GameMap extends React.Component {
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
      cameraAlt: 10,
      cameraPitch: 45,
      cameraHeading: 0,
      cameraZoom: 150
    };
    
  }

  componentDidMount() {
    this.watchLocationChanges();
  }

  async watchLocationChanges() {
    this.watchID = navigator.geolocation.watchPosition(async (position) => {

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
      //alert(lastPosition);
      //alert('position' + position);
      console.log("position:", position.coords);

      let screenCoords;
      
      if (position && this.map) {
        screenCoords = await this.map.pointForCoordinate(position.coords);
        console.log("screenPoint---->>>>:", screenCoords);
      }

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

        // let p1 = {longitude: this.state.currentPosition.coords.longitude,
        //   latitude: this.state.currentPosition.coords.latitude};
        // let p2 = {longitude: this.state.targetPosition.longitude, latitude: this.state.targetPosition.latitude};
        //
        // let midPoint = this.calcualteMidPoint(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
        // markers = [
        //   {
        //     coordinate: {
        //       latitude: position.coords.latitude,
        //       longitude: position.coords.longitude,
        //     }
        //   },
        //   {
        //     coordinate: {
        //       latitude: this.state.targetPosition.latitude,
        //       longitude: this.state.targetPosition.longitude,
        //     },
        //   },
        //   {
        //     coordinate: {
        //       latitude: midPoint[1],
        //       longitude: midPoint[0]
        //     }
        //   }
        // ];
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
    },
    (error) => alert(error.message),
    {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 2});

    //
  }

  onRegionChange(region) {
    this.currentLatDelta = region.latitudeDelta;
    this.currentLongDelta = region.longitudeDelta;
  }

  handleMarkerPress(event) {
    const markerID = event.nativeEvent.id
    console.log(markerID)
    alert('Well Done!');
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  show() {
    this.marker1.showCallout();
  }

  hide() {
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
    this.map.animateCamera({
      center: this.state.currentPosition.coords,
      pitch: this.state.cameraPitch,
      heading: this.state.cameraHeading,
      altitude: this.cameraAlt,
      zoom: this.cameraZoom
    });
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

  
  useBait() {
    let p1 = {longitude: this.state.currentPosition.coords.longitude,
      latitude: this.state.currentPosition.coords.latitude};
    let p2 = {longitude: this.state.targetPosition.longitude, latitude: this.state.targetPosition.latitude};
    let midPoint = this.calcualteMidPoint(p1.latitude, p1.longitude, p2.latitude, p2.longitude);

    let hops = [];
    let hop1 = this.calcualteMidPoint(p2.latitude, p2.longitude, midPoint[1], midPoint[0]);
    let hop2 = midPoint;
    let hop3 = this.calcualteMidPoint(p1.latitude, p1.longitude, midPoint[1], midPoint[0]);

    hops.push(hop1);
    hops.push(hop2);
    hops.push(hop3);

    this.hopIndex = 0;

    this.clearHopId = TimerMixin.setInterval(
      () => {
        let tp = {longitude: hops[this.hopIndex][0], latitude: hops[this.hopIndex][1]};
        let markers = this.generateMarkers(tp, this.state.currentPosition);
        let distanceToTarget = geolib.getDistance(this.state.currentPosition.coords, tp);
        console.log('bait markers:', markers);
        this.hopIndex++;
        this.setState({
          targetPosition: tp,
          markers: markers,
          currentDistance: distanceToTarget,
          region: {
            latitude: this.state.currentPosition.coords.latitude,
            longitude: this.state.currentPosition.coords.longitude,
            latitudeDelta: this.currentLatDelta,
            longitudeDelta: this.currentLongDelta,
          }});
        if (this.hopIndex === 3) {
          TimerMixin.clearInterval(this.clearHopId);
        }
      }, 5000);


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
      var pos = {latitude: this.state.currentPosition.coords.latitude, longitude: this.state.currentPosition.coords.longitude};
      //alert(pos);
      var random = generateRandomPoint(pos, 10);
      //alert(JSON.stringify(random));

      let p1 = {longitude: this.state.currentPosition.coords.longitude,
        latitude: this.state.currentPosition.coords.latitude};
      let p2 = {longitude: random.longitude, latitude: random.latitude};

      let midPoint = this.calcualteMidPoint(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
      //alert(midPoint);

      var markers = [
      {
        coordinate: {
          latitude: this.state.currentPosition.coords.latitude,
          longitude: this.state.currentPosition.coords.longitude,
        }
      },
      {
        coordinate: {
          latitude: random.latitude,
          longitude: random.longitude,
        }
      },
      {
        coordinate: {
          latitude: midPoint[1],
          longitude: midPoint[0]
        }
      }];

      let distanceToTarget = geolib.getDistance(this.state.currentPosition.coords, random);

      this.setState({targetPosition: random,
        markers: markers,
        started: !this.state.started,
        originalDistance: distanceToTarget,
        lastDistance: distanceToTarget,
        currentDistance: distanceToTarget,
        showTarget: distanceToTarget > 0 && distanceToTarget <= CAPTURE_DISTANCE});
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

  render() {
    const { region, markers, showMidPoint, showTarget } = this.state;

    //alert(markers);

    console.log("markers:", markers);
    console.log("region:", region);
    console.log("showMidPoint:", showMidPoint);
    console.log("showTarget:", showTarget);

    var mapview;

    let avtr = avatar;
    if (this.state.imageIndex === 1) {
      avtr = avatar1;
    } else if (this.state.imageIndex ===2) {
      avtr = avatar2;
    }

    if (region) {

      if (showMidPoint && this.state.markers.length > 1) {
        mapview = <MapView
          pitchEnabled
          showsBuildings
          provider={this.props.provider}
          style={styles.map}
          initialRegion={region}
          region={this.state.region}
          onRegionChange={this.onRegionChange}
          ref={ref => { this.map = ref }}
          onLayout={() => {
            this.map.animateCamera({
              center: markers[0].coordinate,
              pitch: 45,
              heading: 20
            });
          }}
        ><MapView.Circle
          center={markers[0].coordinate}
          radius={5}
          fillColor={CIRCLE_COLOR}
          strokeWidth={0}/>
          <MapView.Marker
          ref={ref => { this.marker1 = ref; }}
          coordinate={markers[0].coordinate}
          image={avtr}
          title=""
          description=""
          rotation={this.state.bearing}
          flat={false}
          anchor={{x: 0.5, y: .5}}
          centerOffset={{x: 0.5, y: .5}}
        />
        <MapView.Marker
          ref={ref => { this.marker2 = ref; }}
          coordinate={markers[1].coordinate}
          image={rabbitImage}
          onPress={(event) => this.handleMarkerPress(event)}
        >
        </MapView.Marker>
        </MapView>
      } else if (this.state.showTarget && this.state.markers.length > 1) {
        mapview = <MapView
          pitchEnabled
          showsBuildings
          provider={this.props.provider}
          style={styles.map}
          initialRegion={region}
          region={this.state.region}
          onRegionChange={this.onRegionChange}
          ref={ref => { this.map = ref }}
          onLayout={() => {
            this.map.animateCamera({
              center: markers[0].coordinate,
              pitch: 45,
              heading: 20
            });
          }}
        ><MapView.Circle
          center={markers[0].coordinate}
          radius={5}
          fillColor={CIRCLE_COLOR}
          strokeWidth={0}/>
          <MapView.Marker
          ref={ref => { this.marker1 = ref; }}
          coordinate={markers[0].coordinate}
          image={avtr}
          title=""
          description=""
          rotation={this.state.bearing}
          flat={false}
          anchor={{x: 0.5, y: .5}}
          centerOffset={{x: 0.5, y: .5}}
        />
        <MapView.Marker
          coordinate={markers[1].coordinate}
          image={rabbitImage}
          onPress={(event) => this.handleMarkerPress(event)}
        >
        </MapView.Marker>
        </MapView>
      } else if (this.state.markers.length >= 1) {
        console.log("---------------------------------------------------");
        mapview = <MapView
          scrollEnabled={false}
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

            // let result = await this.map.pointForCoordinate(markers[0].coordinate);
            // console.log("screenPoint:", result);
          }}
        >
        {markers.length > 1 && <MapView.Marker
          coordinate={markers[1].coordinate}
          image={rabbitImage}
          onPress={(event) => this.handleMarkerPress(event)}
        >
        </MapView.Marker>}
        <MapView.Circle
          center={markers[0].coordinate}
          radius={5}
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
      </MapView>
    }
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


    let startButtonText = this.state.started ? <Text>Cancel Mession</Text> : <Text>Lets Go</Text>

    let baitButton = null;
    if (this.state.currentDistance <= CAPTURE_DISTANCE) {
      baitButton = <TouchableOpacity onPress={() => this.useBait()} style={[styles.bubble, styles.button]}>
        <Text>Use Bait</Text>
      </TouchableOpacity>
    }

    console.log("screenCoords in render:", this.state.screenCoords);
    return (
      <View style={styles.container}>
        {mapview}
        {distanceBar}

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => this.toggleStart()} style={[styles.bubble, styles.button]}>
            {startButtonText}
          </TouchableOpacity>
          {baitButton}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => this.pitchPlus()}>
            <Text>{`P+(${this.state.cameraPitch})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.pitchMinus()}>
            <Text>{`P-(${this.state.cameraPitch})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.headingPlus()}>
            <Text>{`H+(${this.state.cameraHeading})`}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.headingMinus()}>
            <Text>{`H-(${this.state.cameraHeading})`}</Text>
          </TouchableOpacity>
          
        </View>
        
        {this.state.screenCoords && <View 
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
        </View>}
      </View>
    );
  }
}

GameMap.propTypes = {
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


