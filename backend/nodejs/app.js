// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const randomPointsOnPolygon = require('random-points-on-polygon');
const turf = require('turf');


const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'us-east-2' });

const TABLE_NAME = "GAME";

exports.handler = async event => {
  
  let connectionId = event.requestContext.connectionId;
  console.log("connectionId:", connectionId);
  
  const postData = JSON.parse(event.body).data;
  console.log("postData:", postData);
  
  let gameInfo;
  try {
    var params = {
      TableName : 'GAME',
      Key: {
        gameId: postData.gameCode
      }
    };
  
    var gameResult = await ddb.get(params).promise();
    console.log("Game Result:", gameResult);
    
    gameInfo = gameResult.Item;
    
    if (gameInfo) {

      let arr = [];
      gameInfo.region.forEach(point => {
          arr.push([point.longitude, point.latitude]);
      });
      
      arr.push([gameInfo.region[0].longitude, gameInfo.region[0].latitude]);

      var polygon = turf.polygon([arr], { name: 'poly1' });
      var randomPoints = randomPointsOnPolygon(5, polygon);
      console.log("Random points:", randomPoints);

      randomPoints.forEach((point, index) => {
        point.id = ++index;
      });

      gameInfo.items = randomPoints;

      const putParams = {
        TableName: 'GAME',
        Item: gameInfo 
      };
  
      await ddb.put(putParams).promise();
    } else {
      gameInfo = {
        gameId: postData.gameCode,
        status: "NOT_FOUNT",
        players: [{connectionId}]
      }
    }
    
    
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  
  var endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;
  console.log("endpoint:", endpoint);
  
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: 'https://' + event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  
  //let toBeRemoved = [];
  gameInfo.stage = "NEW_ITEMS";

  const postCalls = gameInfo.players.map(async ({ connectionId }) => {
    console.log("connectionId:", connectionId, " Data:", postData);
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(gameInfo) }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        
        let found = gameInfo.players.find(element => element.connectionId === connectionId);
        console.log("players with connection:", found);
        found.gone = true;
        
      } else {
        console.log("connection error:", e)
        throw e;
      }
    }
  });
  
  try {
    await Promise.all(postCalls);
  } catch (e) {
    console.log("Promise.all error:", e);
    return { statusCode: 500, body: e.stack };
  }
  
  let removedCount = 0;
  for (let i=gameInfo.players.length -1; i>=0; i--) {
    if (gameInfo.players[i].gone) {
      gameInfo.players.splice(i, 1);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    try {
      const putParams = {
        TableName: 'GAME',
        Item: gameInfo 
      };

      delete gameInfo.stage;
  
      await ddb.put(putParams).promise();  
    } catch (er) {
      console.log("Upldate after remove error:", er);
    }
  }

  return { statusCode: 200, body: 'Data sent.' };
};