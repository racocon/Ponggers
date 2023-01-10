<img src="https://github.com/racocon/ponggers/blob/master/public/assets/ponggers.png" alt="Ponggers" height="60"/>

<b>Ponggers is a peer 2 peer 3D pong game developed using [PeerJS](https://github.com/peers/peerjs)</b>

This game was developed for a hackathon - I wanted to develop a multiplayer 3D pong game that uses PeerJS for P2P networking and ThreeJS for the 3D models.

You play as Maxwell the cat. Move left and right to hit the ball towards the fake Maxwell enemy to defeat them.

Maxwell the cat model is based on ["dingus the cat"](https://sketchfab.com/3d-models/dingus-the-cat-2ca7f3c1957847d6a145fc35de9046b0) by [bean(alwayshasbean)](https://sketchfab.com/alwayshasbean) licensed under [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/)

## Setup Instructions
1. Clone or download the repository.
2. Make sure [Node.js](https://nodejs.org/en/) is installed.
3. Make sure all dependencies are installed by typing: `npm install`.

## Gameplay Instructions
It's a simple pong game at it's core - to play simply:
<ul>
<li>Use your mouse to move Maxwell the cat (he is the paddle)</li>
</ul>

In order to play against another player, one player must host the game, and the other player joins the game.
### Host
Click on HOST GAME button; this will generate an ID for you to copy and share to the other player.
### Join
Click on JOIN GAME button; paste the copied ID from the host and join the game to start.
