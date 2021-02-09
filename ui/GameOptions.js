import React from 'react';
import { Platform, Text, View, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';


export default class GameOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        createGame: false,
        joinGame: false,
        yourName: '',
        gameCode: ''
    }
  }

  
  createNewGame = () => {
    this.setState({createGame: true});
  }

  joinGame = () => {
    this.setState({joinGame: true});
  }

  onNameChange = (name) => {
      console.log(name);
      this.setState({yourName: name});
  }

  onGameCodeChange = (code) => {
      this.setState({gameCode: code});
  }

  proceedToDefineField = () => {
    this.props.defineGameField(this.state.yourName);
  }

  doJoinGame = () => {
      this.props.joinGame(this.state.yourName, this.state.gameCode);
  }

  getCreateGameView = () => {
      return (<View style={{flexDirection: 'column', width: '100%', alignItems: 'center'}}>
          <TextInput placeholder="Your Name" value={this.state.yourName} onChangeText={this.onNameChange} 
            style={{width: 200, borderStyle: 'solid', textAlign: 'center',
            borderWidth: 1, borderRadius: 5, height: 50, fontSize: 16, padding: 5}}/>
        
          {this.state.yourName.length > 0 && <TouchableOpacity onPress={this.proceedToDefineField}>
                <View style={{width: 200, backgroundColor: 'blue', color: '#FFF', marginTop: 10, height: 40, justifyContent: 'center'}}>
                    <Text style={{width: '100%', borderStyle: 'solid', textAlign: 'center',
                        borderRadius: 5, textAlign: 'center', fontSize: 16, 
                        backgroundColor: 'blue', color: '#FFF'}}>Define Game Field</Text>
                </View>
              </TouchableOpacity>}
      </View>)
  }

  getJoinGameView = () => {
    return (<View style={{flexDirection: 'column', width: '100%', alignItems: 'center'}}>
        {this.props.wrongGameCode && <Text>Wrong Game Code</Text>}
        {this.props.wrongGameCode && <Text>{this.props.wrongGameCode}</Text>}
        <TextInput placeholder="Your Name" value={this.state.yourName} onChangeText={this.onNameChange} 
          style={{width: 200, borderStyle: 'solid', textAlign: 'center',
          borderWidth: 1, borderRadius: 5, height: 50, fontSize: 16, padding: 5}}/>
        <TextInput placeholder="Game Code" value={this.state.gameCode} onChangeText={this.onGameCodeChange} 
          style={{width: 200, borderStyle: 'solid', textAlign: 'center',
          borderWidth: 1, borderRadius: 5, height: 50, fontSize: 16, padding: 5}}/>
      
        {this.state.yourName.length > 0 && this.state.gameCode.length === 8 && <TouchableOpacity onPress={this.doJoinGame}>
              <View style={{width: 200, backgroundColor: 'blue', color: '#FFF', marginTop: 10, height: 40, justifyContent: 'center'}}>
                  <Text style={{width: '100%', borderStyle: 'solid', textAlign: 'center',
                      borderRadius: 5, textAlign: 'center', fontSize: 16, 
                      backgroundColor: 'blue', color: '#FFF'}}>Join Game</Text>
              </View>
            </TouchableOpacity>}
    </View>)
  }

  render = () => {
    const {createGame, joinGame} = this.state;
    return <SafeAreaView style={{flexDirection: 'column', paddingTop: 20, justifyContent: 'center', width: '100%', height: '100%', alignItems: 'center'}}>
        {!createGame && !joinGame && this.props.stage !==  'GAME_CODE_NOT_FOUNT' && <TouchableOpacity onPress={this.createNewGame}>
            <Text style={{width: 200, borderStyle: 'solid', 
                borderRadius: 5, textAlign: 'center', fontSize: 26, backgroundColor: 'blue', color: '#FFF'}}>Create Game</Text>
        </TouchableOpacity>}
        {!createGame && !joinGame && this.props.stage !==  'GAME_CODE_NOT_FOUNT' && <TouchableOpacity onPress={this.joinGame}>
            <Text style={{width: 200, borderStyle: 'solid', marginTop: 10,
                borderRadius: 5, textAlign: 'center', fontSize: 26, backgroundColor: 'blue', color: '#FFF'}}>Join Game</Text>
        </TouchableOpacity>}
        {createGame && this.getCreateGameView()}
        {(joinGame || this.props.stage === 'GAME_CODE_NOT_FOUNT') && this.getJoinGameView()}
        
    </SafeAreaView>
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
