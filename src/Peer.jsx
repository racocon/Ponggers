import { useEffect, useState } from "react";

export default function Peer() {
/*
   * START OF PEER STUFF
  */
useEffect(() => {
    peer.on("open", (id) => {
      if (peerId === null) {
        setPeerId(id);
        console.log("Received null id from peer open");
        setLastPeerId(id);
      } else {
        setPeerId(lastPeerId);
      }

      console.log("My peer ID is: " + id);
    });

    peer.on("connection", (conn) => {
      setGameStart(true);
      setHost(true);

      console.log("P1 Successfully connected to: " + conn.peer);

      ready(conn)
    });
  }, []);

  /*
   * Triggered once a connection has been achieved.
  */
  function ready(conn) {
    console.log("Ready to go")
    conn.on("data", function (data) {
      console.log("Data recieved");
      conn.send("Connection Established");
    });
    conn.on("close", function () {
      console.log("Connection Lost");
      conn = null;
    });
  }

  const join = (input) => {
    var conn = peer.connect(input);

    conn.on("open", () => {
      console.log("P2 Successfully connected to: " + conn.peer);

      setHost(false);
      setGameStart(true);
    });
  };

  /*
   * END OF PEER STUFF
  */
}