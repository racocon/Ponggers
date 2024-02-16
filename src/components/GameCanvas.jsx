import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function GameCanvas({
  setPlayer1,
  setPlayer2,
  gameStart,
  host,
  conn
}) {
  const scene = useRef(null);
  const grassTexture = useRef(null);
  const fenceTexture = useRef(null);
  const camera = useRef(null);
  const canvas = useRef(null);
  const renderer = useRef(null);
  const ambientLight = useRef(null);
  const spotLight = useRef(null);
  const baseGeometry = useRef(null);
  const baseMaterial = useRef(null);
  const grass = useRef(null);
  const wallGeometry = useRef(null);
  const wallMaterial = useRef(null);
  const wallRight = useRef(null);
  const wallLeft = useRef(null);
  const ballGeometry = useRef(null);
  const ballMaterial = useRef(null);
  const ball = useRef(null);
  const paddleGeometry = useRef(null);
  const paddleMaterial = useRef(null);
  const paddle1 = useRef(null);
  const paddle2 = useRef(null);
  const maxwell = useRef(null);
  const maxwell2 = useRef(null);
  const gltfLoader = useRef(null);
  const dx = useRef(0);
  const dz = useRef(1);

  useEffect(() => {
    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color("#74b9ff");

    // Load grass texture
    grassTexture.current = new THREE.TextureLoader().load("../assets/grass.png");
    grassTexture.current.wrapS = THREE.RepeatWrapping;
    grassTexture.current.wrapT = THREE.RepeatWrapping;
    grassTexture.current.repeat.set(2, 2);

    // Load fence texture
    fenceTexture.current = new THREE.TextureLoader().load(
      "../assets/picketfence.png"
    );
    fenceTexture.current.wrapS = THREE.RepeatWrapping;
    fenceTexture.current.wrapT = THREE.RepeatWrapping;
    fenceTexture.current.repeat.set(3, 1);

    // Set game window size
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;

    // Set camera position
    camera.current = new THREE.PerspectiveCamera(60, width / height, 1, 1000);

    if (host) {
      // Set Player 1 camera
      camera.current.position.set(0, 70, 96);
      camera.current.lookAt(0, 10, 10);
    } else if (!host) {
      // Set Player 2 camera
      camera.current.position.set(0, 70, -146);
      camera.current.lookAt(0, -50, 20);
    }

    canvas.current = document.getElementById("myThreeJsCanvas");
    renderer.current = new THREE.WebGLRenderer({
      canvas: canvas.current,
      antialias: true,
    });
    renderer.current.setSize(width, height);
    document.body.appendChild(renderer.current.domElement);

    // Set lighting
    ambientLight.current = new THREE.AmbientLight(0xffffff, 2);
    ambientLight.current.castShadow = true;
    scene.current.add(ambientLight.current);

    spotLight.current = new THREE.SpotLight(0xffffff, 1);
    spotLight.current.castShadow = true;
    spotLight.current.position.set(0, 64, 32), scene.current.add(spotLight.current);

    // Floor object
    baseGeometry.current = new THREE.PlaneGeometry(400, 200);
    baseMaterial.current = new THREE.MeshBasicMaterial({
      map: grassTexture.current,
      side: THREE.DoubleSide,
    });
    grass.current = new THREE.Mesh(baseGeometry.current, baseMaterial.current);
    scene.current.add(grass.current);
    grass.current.rotation.x = Math.PI / 2;
    grass.current.position.set(0, -6, -25);

    // Wall object
    wallGeometry.current = new THREE.PlaneGeometry(200, 100);
    wallMaterial.current = new THREE.MeshBasicMaterial({
      map: fenceTexture.current,
      side: THREE.DoubleSide,
      //  transparent: true, opacity: 0.5,
      alphaTest: 0.5,
    });
    wallRight.current = new THREE.Mesh(wallGeometry.current, wallMaterial.current);
    wallLeft.current = new THREE.Mesh(wallGeometry.current, wallMaterial.current);
    scene.current.add(wallRight.current);
    scene.current.add(wallLeft.current);
    wallRight.current.rotation.y = Math.PI / 2;
    wallRight.current.position.set(80, 0, -25);
    wallLeft.current.rotation.y = Math.PI / 2;
    wallLeft.current.position.set(-80, 0, -25);

    // Ball object
    ballGeometry.current = new THREE.SphereGeometry(3, 16, 8);
    ballMaterial.current = new THREE.MeshToonMaterial({ color: 0xc23616 });
    ball.current = new THREE.Mesh(ballGeometry.current, ballMaterial.current);
    scene.current.add(ball.current);
    ball.current.position.set(0, 0, 0);

    // Paddle mesh
    paddleGeometry.current = new THREE.BoxGeometry(28, 4, 4);
    paddleMaterial.current = new THREE.MeshBasicMaterial({
      opacity: 0,
      transparent: true,
    });

    paddle1.current = new THREE.Mesh(paddleGeometry.current, paddleMaterial.current);
    paddle2.current = new THREE.Mesh(paddleGeometry.current, paddleMaterial.current);

    // Load Maxwell model
    gltfLoader.current = new GLTFLoader();

    gltfLoader.current.load("../assets/maxwell/scene.gltf", (gltf) => {
      if (maxwell.current) scene.current.remove(maxwell.current);
      maxwell.current = gltf.scene;

      scene.current.add(maxwell.current);
      scene.current.add(paddle1.current);

      // Player 1 Maxwell
      maxwell.current.position.set(-2, -5, 50);
      paddle1.current.position.set(0, 0, 43);
      maxwell.current.rotation.y = Math.PI - 0.3;

      // Player 2 Maxwell
      if (maxwell2.current) scene.current.remove(maxwell2.current);
      maxwell2.current = maxwell.current.clone();
      maxwell2.current.position.set(2, -5, -100);
      paddle2.current.position.set(0, 0, -93);
      maxwell2.current.rotation.y = Math.PI + 0.3;
      scene.current.add(maxwell2.current);
      scene.current.add(paddle2.current);

      if (host) {
        movement(maxwell.current, paddle1.current);
        console.log("Host");
      } else if (!host) {
        movement(maxwell2.current, paddle2.current);
        console.log("Client");
      }
    });

    // Ball movement stuff
    // let dx = 0;
    // let dz = 1;

    const startBallMovement = () => {
      var direction = Math.random() > 0.5 ? -1 : 1;
      ball.current.$velocity = {
        x: dx.current,
        z: direction * dz.current,
      };
      ball.current.$stopped = false;
    };

    const updateBallPosition = () => {
      ball.current.position.z += dz.current;
      ball.current.position.x += dx.current;

      // Adds arc to ball's flight
      ball.current.position.y =
        -(((ball.current.position.z - 20) * (ball.current.position.z + 70)) / 100) + 30;

      // var myMessage = new Message(null, ball.position.x, ball.position.z, null);
      // send(myMessage);
    };

    // Bounce back when collide with walls
    const isSideCollision = () => {
      return ball.current.position.x - 3 < -80 || ball.current.position.x + 3 > 80;
    };

    const checkCollisionWith = (paddle) => {
      if (Math.abs(ball.current.position.z - paddle.position.z) <= 1) {
        if (
          ball.current.position.z + 3 >= paddle.position.z &&
          isBallAlignedWithPaddle(paddle)
        ) {
          dz.current *= -1;
          dx.current = (ball.current.position.x - paddle.position.x) / 15;
        }
      }
    };

    const isBallAlignedWithPaddle = (paddle) => {
      var halfPaddleWidth = 28 / 2,
        paddleX = paddle.position.x,
        ballX = ball.current.position.x;
      return (
        ballX > paddleX - halfPaddleWidth && ballX < paddleX + halfPaddleWidth
      );
    };

    const reset = () => {
      ball.current.position.set(0, 0, 0);
      dx.current = 0;
      ball.current.$stopped = true;
    };

    const checkOutOfBounds = () => {
      if (ball.current.position.z < -130) {
        setPlayer1((prev) => prev + 1);
        reset();
      } else if (ball.current.position.z > 80) {
        setPlayer2((prev) => prev + 1);
        reset();
      }
    };

    const processBallMovement = () => {
      if (ball.current.$stopped) {
        startBallMovement();
      }

      updateBallPosition();

      if (isSideCollision()) {
        dx.current *= -1;
      }

      checkCollisionWith(paddle1.current);
      checkCollisionWith(paddle2.current);

      // Send the new ball position to the client
      if (conn) {
        conn.send({
          type: "ballPosition",
          data: {x: ball.current.position.x, y: ball.current.position.y, z: ball.current.position.z}
        });
      }
    };

    function movement(model, paddle) {
      // Use mouse to move paddle
      canvas.current.onmousemove = (e) => {
        var mouseX = e.clientX;

        model.position.x = paddle.position.x = host
          ? -((width - mouseX) / width) * 100 + 50
          : ((width - mouseX) / width) * 100 - 50;
        if (conn) {
          conn.send({
            type: "move",
            data: paddle.position.x
          });
        }
      };
    }

    const render = () => {
      // Render when game starts
      if (gameStart) {
        if (host) {
          processBallMovement();
          checkOutOfBounds();
        }
        window.requestAnimationFrame(render);

        renderer.current.render(scene.current, camera.current);
      }
    };
    render();
    // canvas.addEventListener("mousemove", movement);
    canvas.current.style.cursor = "none";

    conn.on("data", function (data) {
      if (data.type === "move") {
        if (host) {
          maxwell2.current.position.x = paddle2.current.position.x = data.data
        } else {
          maxwell.current.position.x = paddle1.current.position.x = data.data
        }
      }
      if (!host && data.type === "ballPosition") {
        ball.current.position.x = data.data.x;
        ball.current.position.y = data.data.y;
        ball.current.position.z = data.data.z;
        if (ball.current.position.z < -130) {
          console.log("Player 1 scored!")
          setPlayer1((prev) => prev + 1);
        } else if (ball.current.position.z > 80) {
          setPlayer2((prev) => prev + 1);
        }
      }
    });

    // Clean up all event listeners and canvas
    return () => {
      canvas.current.removeEventListener("mousemove", movement);
      canvas.current.style.cursor = "auto";
      conn.off("data");
    };
  }, [gameStart]);

  return (
    <canvas
      className="mx-auto border-8 border-white rounded-lg"
      id="myThreeJsCanvas"
    />
  );
}
