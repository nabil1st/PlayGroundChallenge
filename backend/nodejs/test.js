// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const randomPointsOnPolygon = require('random-points-on-polygon');
const turf = require('turf');

  
  let gameInfo = { gameId: '11111111',
  region:
   [ { longitude: -96.62928711622952, latitude: 32.94827612158893 },
     { longitude: -96.62919357419014, latitude: 32.94834955415681 },
     { longitude: -96.62908628582954, latitude: 32.94825980323223 },
     { longitude: -96.62918820977211, latitude: 32.94817793005226 } 
   ],
   players:
    [ { admin: true,
       name: 'Senjal',
       location: [Object],
       connectionId: 'Go6qGd3wCYcCJ3A=' } 
    ] 
  };

  

  var polygon = turf.polygon([[[-96.62928711622952, 32.94827612158893], [-96.62919357419014, 32.94834955415681], [-96.62908628582954, 32.94825980323223], [-96.62918820977211, 32.94817793005226], [-96.62928711622952, 32.94827612158893]]], { name: 'poly1' });
  var points = randomPointsOnPolygon(5, polygon);

  console.log(JSON.stringify(points));
  