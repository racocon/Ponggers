export default function ScoreDisplay({player1, player2}) {
  return (
    <div className="mx-auto w-[80vw] pb-6 font-bold text-3xl text-[#00FF9C] uppercase flex flex-row justify-between">
      <code className="grid grid-cols-2">
        <div className="text-left">Player 1 </div>
        <div className="text-left px-4 pt-8 text-white">{player1} </div>
      </code>
      <code className="grid grid-cols-2">
        <div className="text-right px-4 pt-8 text-white">{player2} </div>
        <div className="text-right">Player 2 </div>
      </code>
    </div>
  );
}
