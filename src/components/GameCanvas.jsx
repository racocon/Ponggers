import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function GameCanvas({
  setPlayer1,
  setPlayer2,
  gameStart,
  host,
}) {
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#74b9ff");

    const movement = (model, paddle) => {
      window.onkeydown = (e) => {
        switch (e.key) {
          case "ArrowLeft":
            {
              (host ? paddle.position.x > -40 : paddle.position.x < 40) &&
                ((model.position.x += host ? -2.5 : 2.5),
                (paddle.position.x += host ? -2.5 : 2.5));
            }
            break;
          case "ArrowRight":
            {
              (host ? paddle.position.x < 40 : paddle.position.x > -40) &&
                ((model.position.x += host ? 2.5 : -2.5),
                (paddle.position.x += host ? 2.5 : -2.5));
            }
            break;
          default:
            break;
        }
      };
    };

    // Load grass texture
    const grassTexture = new THREE.TextureLoader().load(
      "/src/assets/grass.png"
    );
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(2, 2);

    // Load fence texture
    const fenceTexture = new THREE.TextureLoader().load(
      "/src/assets/picketfence.png"
    );
    fenceTexture.wrapS = THREE.RepeatWrapping;
    fenceTexture.wrapT = THREE.RepeatWrapping;
    fenceTexture.repeat.set(3, 1);

    // Set game window size
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;

    // Set camera position
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);

    if (host) {
      // Set Player 1 camera
      camera.position.set(0, 70, 96);
      camera.lookAt(0, 10, 10);
    } else if (!host) {
      // Set Player 2 camera
      camera.position.set(0, 70, -146);
      camera.lookAt(0, -50, 20);
    }

    const canvas = document.getElementById("myThreeJsCanvas");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    // Set lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    ambientLight.castShadow = true;
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.castShadow = true;
    spotLight.position.set(0, 64, 32), scene.add(spotLight);

    // Floor object
    const baseGeometry = new THREE.PlaneGeometry(400, 200);
    const baseMaterial = new THREE.MeshBasicMaterial({
      map: grassTexture,
      side: THREE.DoubleSide,
    });
    const grass = new THREE.Mesh(baseGeometry, baseMaterial);
    scene.add(grass);
    grass.rotation.x = Math.PI / 2;
    grass.position.set(0, -6, -25);

    // Wall object
    const wallGeometry = new THREE.PlaneGeometry(200, 100);
    const wallMaterial = new THREE.MeshBasicMaterial({
      map: fenceTexture,
      side: THREE.DoubleSide,
      //  transparent: true, opacity: 0.5,
      alphaTest: 0.5,
    });
    const wallRight = new THREE.Mesh(wallGeometry, wallMaterial);
    const wallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
    scene.add(wallRight);
    scene.add(wallLeft);
    wallRight.rotation.y = Math.PI / 2;
    wallRight.position.set(50, 0, -25);
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.set(-50, 0, -25);

    // Ball object
    const ballGeometry = new THREE.SphereGeometry(3, 16, 8);
    const ballMaterial = new THREE.MeshToonMaterial({ color: 0xc23616 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    ball.position.set(0, 0, 0);

    // Paddle mesh
    const paddleGeometry = new THREE.BoxGeometry(28, 4, 4);
    const paddleMaterial = new THREE.MeshBasicMaterial({
      opacity: 0,
      transparent: true,
    });

    const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);

    // Load Maxwell model
    let maxwell;
    const gltfLoader = new GLTFLoader();

    gltfLoader.load("/src/assets/maxwell/scene.gltf", (gltf) => {
      maxwell = gltf.scene;

      scene.add(maxwell);
      scene.add(paddle1);

      // Player 1 Maxwell
      maxwell.position.set(0, -5, 50);
      paddle1.position.set(0, 0, 43);
      maxwell.rotation.y = Math.PI - 0.3;

      // Player 2 Maxwell
      const maxwell2 = maxwell.clone();
      maxwell2.position.set(0, -5, -100);
      paddle2.position.set(0, 0, -93);
      maxwell2.rotation.y = Math.PI + 0.3;
      scene.add(maxwell2);
      scene.add(paddle2);

      if (host) {
        movement(maxwell, paddle1);
      } else if (!host) {
        movement(maxwell2, paddle2);
      }
    });

    // Ball movement stuff
    let dx = 0;
    let dz = 1;

    const startBallMovement = () => {
      var direction = Math.random() > 0.5 ? -1 : 1;
      ball.$velocity = {
        x: dx,
        z: direction * dz,
      };
      ball.$stopped = false;
    };

    const updateBallPosition = () => {
      ball.position.z += dz;
      ball.position.x += dx;

      // Adds arc to ball's flight
      ball.position.y =
        -(((ball.position.z - 20) * (ball.position.z + 70)) / 100) + 30;

      // var myMessage = new Message(null, ball.position.x, ball.position.z, null);
      // send(myMessage);
    };

    // Bounce back when collide with walls
    const isSideCollision = () => {
      return ball.position.x - 3 < -50 || ball.position.x + 3 > 50;
    };

    const checkCollisionWith = (paddle) => {
      if (Math.abs(ball.position.z - paddle.position.z) <= 1) {
        if (
          ball.position.z + 3 >= paddle.position.z &&
          isBallAlignedWithPaddle(paddle)
        ) {
          dz *= -1;
          dx = (ball.position.x - paddle.position.x) / 15;
        }
      }
    };

    const isBallAlignedWithPaddle = (paddle) => {
      var halfPaddleWidth = 28 / 2,
        paddleX = paddle.position.x,
        ballX = ball.position.x;
      return (
        ballX > paddleX - halfPaddleWidth && ballX < paddleX + halfPaddleWidth
      );
    };

    const reset = () => {
      ball.position.set(0, 0, 0);
      dx = 0;
      ball.$stopped = true;
    };

    const checkOutOfBounds = () => {
      if (ball.position.z < -130) {
        setPlayer1((prev) => prev + 1);
        reset();
      } else if (ball.position.z > 80) {
        setPlayer2((prev) => prev + 1);
        reset();
      }
    };

    const processBallMovement = () => {
      if (ball.$stopped) {
        startBallMovement();
      }

      updateBallPosition();

      if (isSideCollision()) {
        dx *= -1;
      }

      checkCollisionWith(paddle1);
      checkCollisionWith(paddle2);
      checkOutOfBounds();
    };

    const render = () => {
      // Render when game starts
      if (gameStart) {
        processBallMovement();
        window.requestAnimationFrame(render);

        renderer.render(scene, camera);
      }
    };
    render();
  }, [gameStart]);
  
  return (
      <canvas
        className="mx-auto border-8 border-[#ff4081]"
        id="myThreeJsCanvas"
      />
  );
}
