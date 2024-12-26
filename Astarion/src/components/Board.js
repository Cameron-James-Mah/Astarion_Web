import { useEffect, useState, useRef } from "react";
import './Board.css';
import WebAssemblyWrapper from '../a.out.js'
import WebAssemblyBinary from '../a.out.wasm'
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";
import GameOverPopup from "./gameoverPopup.js";

const wasmModuleInstance = WebAssemblyWrapper({
  locateFile: ()=>{
    return WebAssemblyBinary
  }
})

function Board({color, difficulty}) {
  //test pos for promotion 1k6/6P1/4K3/8/8/8/8/8 w - - 0 1
  //test pos for win for white rnbqkbnr/pppp1ppp/8/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1
  const [text, setText] = useState("")
  const [game, setGame] = useState(new Chess());
  const [pTimer, setPTimer] = useState("00:00:00");
  const [eTimer, setETimer] = useState("00:00:00");
  const turn = useRef(true)
  const Ref = useRef(null);
  const playerTime = useRef(600000)
  const engineTime = useRef(600000)
  const timeMS = useRef(100000);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(""); // "win", "lose", "draw"
  /*
  const clearTimer = (e) => {
    
    setPTimer("00:10:00");
    setETimer("00:10:00")
    
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      if(turn.current){
        startPTimer(e);
      }
      else{
        startETimer(e);
      }  
    }, 1000);
    Ref.current = id;
  };

  const startPTimer = (e) => {
    let { total, hours, minutes, seconds } =
        getTimeRemaining(e);
    if (total >= 0) {
        setPTimer(
            (hours > 9 ? hours : "0" + hours) +
            ":" +
            (minutes > 9
                ? minutes
                : "0" + minutes) +
            ":" +
            (seconds > 9 ? seconds : "0" + seconds)
        );
    }
  };

  const startETimer = (e) => {
    let { total, hours, minutes, seconds } =
        getTimeRemaining(e);
    if (total >= 0) {
        setETimer(
            (hours > 9 ? hours : "0" + hours) +
            ":" +
            (minutes > 9
                ? minutes
                : "0" + minutes) +
            ":" +
            (seconds > 9 ? seconds : "0" + seconds)
        );
    }
  };

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor(
        (total / 1000 / 60) % 60
    );
    const hours = Math.floor(
        (total / 1000 / 60 / 60) % 24
    );
    return {
        total,
        hours,
        minutes,
        seconds,
    };
  };

  const getDeadTime = () => {
    let deadline = new Date();

    
    deadline.setSeconds(deadline.getSeconds() + (600));
    return deadline;
  };*/

  function astarionFirst(){//a bit hacky to have function just for this imo, will change later
    turn.current = false
    wasmModuleInstance.then((core)=>{
        //console.log(game.fen())
        let res;
        if(difficulty == "easy"){
            res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 360000]);
            //console.log("e") 
        }
        else if(difficulty == "medium"){
            res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 720000]); 
            //console.log("m") 
        }
        else if(difficulty == "hard"){
            res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 1080000]); 
            //console.log("h") 
        }
        if(res.length == 4){//no promotion
          game.move({from: res.substring(0,2), to: res.substring(2,4) })
        }
        else{
          game.move({from: res.substring(0,2), to: res.substring(2,4), promotion: res.substring(4,6)})
        }
        setGame(new Chess(game.fen()));
      })
      turn.current = true
  }

  function makeAMove(move) { //Kind of hacky function validating move/updating board
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    //console.log(move)
    if(result){//valid move
        //console.log("valid")
        if(result.captured){
            //captureSound.play()
        }
        else{
            //moveSound.play()
        }
        setGame(gameCopy); 
        if(game.in_checkmate()){
            setResult("win")
            setGameOver(true);
            return result
        }
        else if(game.in_draw() || game.in_stalemate()){
            setResult("draw")
            setGameOver(true);
            return result
        }
        //console.log(game.fen())
        turn.current = false
        //console.log(move)
        
        if(!turn.current){
          wasmModuleInstance.then((core)=>{
            //console.log(game.fen())
            let res;
            if(difficulty == "easy"){
                res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 300000]);
                //console.log("e") 
            }
            else if(difficulty == "medium"){
                res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 600000]); 
                //console.log("m") 
            }
            else if(difficulty == "hard"){
                res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 900000]); 
                //console.log("h") 
            }

            //res = core.UTF8ToString(res)
            //setText(text +'\n' + res +'\n')
            if(res.length == 4){//no promotion
              game.move({from: res.substring(0,2), to: res.substring(2,4) })
            }
            else{
              game.move({from: res.substring(0,2), to: res.substring(2,4), promotion: res.substring(4,6)})
            }
            setGame(game)
            if(game.in_checkmate()){
                setResult("lose")
                setGameOver(true);
                return result
            }
            else if(game.in_draw() || game.in_stalemate()){
                setResult("draw")
                setGameOver(true);
                return result
            }
          })
        }
        turn.current = true
        
        //turn.current = true;
    }
    
    //console.log(gameCopy.pgn())
    return result;
  }
  function onDrop(sourceSquare, targetSquare) {//When moving a piece on the board
    //console.log(game.fen())
    if(turn.current && `${color}` == "white" || turn.current && `${color}` == "black"){
        
        const try1 = makeAMove({
            from: sourceSquare,
            to: targetSquare,
            //promotion: ""
        });
        if(!try1){
            makeAMove({
                from: sourceSquare,
                to: targetSquare,
        });
        }
    }
  }
  function promocheck(piece, source, target){
    //console.log(piece)
    const try1 = makeAMove({
      from: source,
      to: target,
      promotion: piece[1].toLowerCase() //weird that i have to do this..
    });
    //console.log(try1)
    return try1;
  }

  useEffect(()=>{
    wasmModuleInstance.then((core)=>{
      let res = core._initEngine();
      res = core.UTF8ToString(res)
      setText(text +'\n' + res +'\n')
      //color.current = "white"
      //console.log(res);
      //clearTimer(getDeadTime());
      document.title = 'Astarion'
    })
  },[])

  useEffect(()=>{
    //console.log(difficulty)
    if(color == 'black'){
        astarionFirst()
    }
  },[difficulty])

  return (
    <>
            <div className = "board-container">
        <Chessboard
            position={game.fen()}
            id="BasicBoard"
            onPromotionPieceSelect={promocheck}
            onPieceDrop={onDrop}
            boardOrientation={color}
            animationDuration={500}
        />
        </div>
            {gameOver && <GameOverPopup result={result} onClose={() => setGameOver(false)} />}
        </>
  );
}

export default Board;
