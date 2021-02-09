import React from 'react';
import { Platform, Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import Constants from 'expo-constants';
import {DestinationButton} from './components/DestinationButton';
import {CurrentLocationButton} from './components/CurrentLocationButton';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Driver from './components/Driver';
// import GameMap from './GameMap';
import MultiplayerGameMap from './MultiplayerGameMap';
import GameOptions from './GameOptions';
import DefineFieldMap from './DefineFieldMap';
import RegionTestMap from './RegionTestMap';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.ws = new WebSocket('wss://mlbw5duwj0.execute-api.us-east-2.amazonaws.com/dev');
    this.state = {
      location: null,
      stage: 'START'
    }

    this._getLocationAsync();

  }

  UNSAFE_componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  componentDidMount = () => {
    this.ws.onopen = () => {
      // connection opened
      // this.ws.send('{"action":"sendlocation", "data":"Hello there!"}'); // send a message
    };
    
    this.ws.onmessage = (e) => {
      // a message was received
      console.log("-------------------------------------------------------------------------");
      let message = JSON.parse(e.data);
      console.log(message);
      if (message.status === 'NOT_FOUNT') {
        this.setState({wrongGameCode: message.gameId, stage: 'GAME_CODE_NOT_FOUNT'});
      } else if (message.status === 'NEW_ITEMS') {
        this.setState({gameCode: message.gameId, stage: 'NEW_ITEMS', gameInfo: message});
      } else {
        this.setState({gameCode: message.gameId, stage: 'WAIT_FOR_PLAYERS', gameInfo: message});
      }
    };
    
    this.ws.onerror = (e) => {
      // an error occurred
      console.log(e.message);
    };
    
    this.ws.onclose = (e) => {
      // connection closed
      console.log(e.code, e.reason);
    };
  }

  _getLocationAsync = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      console.log('Permission to access location was not granted');
    }

    let loc = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    let location = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.045,
      longitudeDelta: 0.045
    }

    this.setState({location});
  }

  centerMap = () => {
    console.log("center map...........");
    const {latitude, longitude, latitudeDelta, longitudeDelta} = this.state.location;
    this.map.animateToRegion({latitude, longitude, latitudeDelta, longitudeDelta
    });
  }

  defineGameField = (adminName) => {
    this.setState({stage: 'DEFINE_GAME_FIELD', playerName: adminName, admin: true});
  }

  joinGame = (playerName, gameCode) => {
    let message = {
      action: 'joingame',
      data: {
        playerName: playerName,
        gameCode: gameCode,
        location: this.state.location
      }
    }
    this.ws.send(JSON.stringify(message)); 
    this.setState({stage: 'JOINING_GAME', playerName, gameCode});
  }

  setRegion = (points) => {
    let message = {
      action: 'setregion',
      data: {
        region: points,
        adminName: this.state.playerName,
        location: this.state.location
      }
    }
    this.ws.send(JSON.stringify(message)); 
    this.setState({stage: 'WAIT_FOR_GAME_CODE'})
  }

  getOtherPlayers = () => {
    let self = this;
    return this.state.gameInfo.players.map((player, index) => {
      if (player.name !== self.state.playerName) {
        return <Text key={index}>{player.name}</Text>
      }
    });
  }

  startGame = (currentPosition) => {
    let message = {
      action: 'startgame',
      data: {
        gameCode: this.state.gameCode,
        location: currentPosition
      }
    }
    this.ws.send(JSON.stringify(message)); 
    this.setState({stage: 'STARTING_GAME'});
  }

  render__ = () => {
    return <RegionTestMap initialPosition={{ longitude: -96.62928711622952, latitude: 32.94827612158893 }}/>
  }
  render = () => {
    // const initialPosition = {
    //   coords: {
    //     latitude:33.0834355,
    //     longitude:-96.8331368
    //   }
    // }

    const {stage} = this.state;
    console.log("---------------stage:", stage);
    if (stage === 'START' || stage === 'GAME_CODE_NOT_FOUNT') {
      return <GameOptions defineGameField={this.defineGameField} 
        joinGame={this.joinGame} stage={stage} gameInfo={this.state.gameInfo} 
        wrongGameCode={this.state.wrongGameCode}/>
    }  else if (stage === 'DEFINE_GAME_FIELD') {
      return <DefineFieldMap initialPosition={{coords: this.state.location}} setRegion={this.setRegion}/>
      //return <MultiplayerGameMap initialPosition={{coords: this.state.region}} ws={this.ws}/>
    } else if (stage === 'WAIT_FOR_GAME_CODE' || stage === 'JOINING_GAME') {
      return <SafeAreaView style={{flexDirection: 'column', paddingVertical: 30, alignItems: 'center'}}>
        <Text style={{fontSize: 14}}>Waiting for Game</Text></SafeAreaView>
    } else if (stage === 'WAIT_FOR_PLAYERS_') {
      return <SafeAreaView style={{flexDirection: 'column', paddingVertical: 30, alignItems: 'center'}}>
        <Text style={{fontSize: 14}}>{`Welcome ${this.state.playerName}`}</Text>
        <Text style={{marginTop: 10}}>{`Game Code:  ${this.state.gameCode}`}</Text>

        {this.state.gameInfo && this.state.gameInfo.players && this.getOtherPlayers()}
        <Text style={{marginTop: 10}}>Waiting for Other Players</Text>

        {this.state.admin && <TouchableOpacity onPress={this.startGame}>
          <Text>Start Game</Text>
        </TouchableOpacity>}
      </SafeAreaView> 
    } else if (stage === 'WAIT_FOR_PLAYERS' || stage === 'STARTING_GAME' || stage === 'NEW_ITEMS') {
      return <MultiplayerGameMap initialPosition={{coords: this.state.location}} 
        stage={stage} gameInfo={this.state.gameInfo} playerName={this.state.playerName} startGame={this.startGame}/>
    }
    
    // if (this.state.region) {
    //   return <MultiplayerGameMap initialPosition={{coords: this.state.region}} ws={this.ws}/>
    // } else {
    //   return <View/>
    // }
  }
  render_() {
    return (
      <View style={styles.container}>
        <DestinationButton/>
        <CurrentLocationButton cb={() => {this.centerMap()}}/>
        <MapView
          initialRegion={this.state.region}
          showsUserLocation={true}
          showsCompass={true}
          rotateEnabled={false}
          style={{flex: 1}}
          ref={(map) => {this.map = map}}
        >
          {this.state.region && <Driver driver={{uid: 'null', location: this.state.region}} />}
          
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
