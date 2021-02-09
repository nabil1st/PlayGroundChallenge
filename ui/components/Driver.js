import React from 'react'
import {Image, View} from 'react-native';
import MapView from 'react-native-maps';

export default class Driver extends React.Component {
    constructor(props) {
        super(props);
        const driver = props.driver ? 
            props.driver :
            {uid: 'noDriversPassed', location: {latitude: 0, longitude: 0}};

        // const coordinate = new MapView.AnimatedRegion({
        //     latitude: driver.location.latitude,
        //     longitude: driver.location.longitude
        // });

        this.state = {
            driver: driver,
            coordinate: props.driver.location
        }
    }

    render() {
        console.log("coordinate:", this.state.coordinate);
        return (
            <MapView.Marker.Animated
                coordinate={this.state.coordinate}
                anchor={{x:0.35, y: 0.32}}
                ref={marker => {this.marker = marker}}
                style={{width: 50, height: 50}}>
                <Image source={require('../assets/car.png')}
                    style={{width: 50, height: 36}}/>
            </MapView.Marker.Animated>
        )
    }
}