import "./App.css";
import {useEffect, useRef, useState} from "react";
import GameCanvas from "./components/GameCanvas";
import ScoreDisplay from "./components/ScoreDisplay";

function App() {
  // Set states
  const [player1, setPlayer1] = useState(0);
  const [player2, setPlayer2] = useState(0);

  const [waiting, setWaiting] = useState(true);

  const [peerId, setPeerId] = useState(null);
  const [input, setInput] = useState("");

  const [gameStart, setGameStart] = useState(false);
  const [host, setHost] = useState(null);

  const connRef = useRef(null);
  const peer = useRef(null);

  const [lastPeerId, setLastPeerId] = useState(null);

  /*
   * START OF PEER STUFF
   */
  useEffect(() => {
    if (host === null) return;
    peer.current = new Peer({
      host: "1.peerjs.com",
      secure: true,
    })

    if (host) {
      peer.current.on("open", (id) => {
        if (peerId === null) {
          setPeerId(id);
          console.log("Received null id from peer open");
          setLastPeerId(id);
        } else {
          setPeerId(lastPeerId);
        }

        console.log("My peer ID is: " + id);
      });

      peer.current.on("connection", (conn) => {
        setGameStart(true);

        console.log("P1 Successfully connected to: " + conn.peer);

        connRef.current = conn;

        ready(conn);
      });
    }
  }, [host]);

  /*
   * Triggered once a connection has been achieved.
   */
  function ready(conn) {
    console.log("Ready to go");
    conn.on("close", function () {
      console.log("Connection Lost");
      conn = null;
    });
  }

  const join = (input) => {
    console.log("Joining")
    var conn = peer.current.connect(input);

    conn.on("open", () => {
      console.log("P2 Successfully connected to: " + conn.peer);

      connRef.current = conn;

      setGameStart(true);
    });
    conn.on("close", function () {
      console.log("Connection Lost");
      conn = null;
    });
  };

  /*
   * END OF PEER STUFF
   */

  return (
    <div className="App">
      <img className="mx-auto py-8 h-40 w-auto" src="../assets/ponggers.png" />
      {!gameStart && (
        <div>
          {waiting ? (
            <div className="text-white font-medium text-lg py-6 flex justify-around mx-auto">
              <button
                id="set-host"
                className="text-lg border-4 border-white rounded-lg uppercase px-4 py-1 hover:bg-white hover:text-black active:bg-transparent active:text-white"
                onClick={() => {
                  setHost(true);
                  setWaiting(false);
                }}
              >
                Host Game
              </button>
              <div>
                <button
                  id="set-join"
                  className="text-lg border-4 border-white rounded-lg uppercase px-4 py-1 hover:bg-white hover:text-black active:bg-transparent active:text-white"
                  onClick={() => {
                    setHost(false);
                    setWaiting(false);
                  }}
                >
                  Join Game
                </button>
              </div>
            </div>
          ) : (
            <div className="text-white font-medium text-lg py-6 flex justify-around mx-auto">
              {host ? (
                <div>
                  <button
                    id="my-id"
                    className={`text-lg px-4 py-1 rounded-lg uppercase ${
                      peerId
                        ? "border-4 border-white hover:bg-white hover:text-black active:bg-transparent active:text-white"
                        : "text-white hover:cursor-disabled"
                    }`}
                    disabled={!peerId}
                    onClick={() => {
                      navigator.clipboard.writeText(peerId);
                    }}
                  >
                    {peerId ? <p>Copy ID</p> : <p>Generating ID...</p>}
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    className="text-black p-2"
                    type="text"
                    value={input}
                    id="id-input"
                    placeholder="Enter Id"
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button
                    id="join-game"
                    className="ml-4 text-lg border-4 border-white rounded-lg uppercase px-4 py-1 hover:bg-white hover:text-black active:bg-transparent active:text-white"
                    onClick={() => {
                      join(input);
                    }}
                  >
                    Join Game
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Display game canvas and score when game starts */}
      {gameStart && (
        <div>
          <ScoreDisplay player1={player1} player2={player2} />
          <GameCanvas
            setPlayer1={setPlayer1}
            setPlayer2={setPlayer2}
            gameStart={gameStart}
            host={host}
            conn={connRef.current ? connRef.current : null}
          />
        </div>
      )}
    </div>
  );
}

export default App;
