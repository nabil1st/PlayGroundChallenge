# PlayGroundChallenge mobile application
### This is a mobile multiplayer game where players compete to collect imaginary objects in the play field.

#### The admin start a game by drawing a play region on the map. After all players join the game, imaginary objects 
#### are created and randomly added to the region. Players need to move towards the objects which are only visible 
#### on their screen and the person who first reaches the object's location wins it.


## Architecture

###Database: AWS Dynamo DB. 
####Stores game and connection info.

###Backend: AWS Lambda services 

###Frontend: React Native, Expo SDK, Google maps SDK.
####ui and backend communicate via web sockets.