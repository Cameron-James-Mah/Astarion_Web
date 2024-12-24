import { useEffect, useState, useRef } from "react";
import './App.css';
import WebAssemblyWrapper from './a.out.js'
import WebAssemblyBinary from './a.out.wasm'
import { Chessboard } from "react-chessboard";
import Chess from "chess.js";

const wasmModuleInstance = WebAssemblyWrapper({
  locateFile: ()=>{
    return WebAssemblyBinary
  }
})

function App() {
  //test pos for promotion 1k6/6P1/4K3/8/8/8/8/8 w - - 0 1
  const [text, setText] = useState("")
  const [game, setGame] = useState(new Chess());
  const [pTimer, setPTimer] = useState("00:00:00");
  const [eTimer, setETimer] = useState("00:00:00");
  const turn = useRef(true)
  const color = useRef("")
  const Ref = useRef(null);
  const playerTime = useRef(600000)
  const engineTime = useRef(600000)
  const timeMS = useRef(100000);
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

  function makeAMove(move) { //Kind of hacky function validating move/updating board
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    //console.log(move)
    if(result){//valid move
        //console.log("valid")
        setGame(gameCopy); 
        //console.log(game.fen())
        turn.current = false
        //console.log(move)
        
        if(!turn.current){
          wasmModuleInstance.then((core)=>{
            //console.log(game.fen())
            let res = core.ccall("engineMove", "string", ['string', 'number'], [game.fen(), 720000]); //assuming black for now
            //res = core.UTF8ToString(res)
            //setText(text +'\n' + res +'\n')
            if(res.length == 4){//no promotion
              game.move({from: res.substring(0,2), to: res.substring(2,4) })
            }
            else{
              game.move({from: res.substring(0,2), to: res.substring(2,4), promotion: res.substring(4,6)})
            }
            setGame(game)
          })
        }
        turn.current = true
        if(result.captured){
            //captureSound.play()
        }
        else{
            //moveSound.play()
        }
        //turn.current = true;
    }
    
    //console.log(gameCopy.pgn())
    return result;
  }
  function onDrop(sourceSquare, targetSquare) {//When moving a piece on the board
    //console.log(game.fen())
    if(turn.current && `${color.current}` == "white" || turn.current && `${color.current}` == "black"){
        
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
      color.current = "white"
      //console.log(res);
      //clearTimer(getDeadTime());
    })
  },[])

  useEffect(()=>{
    
  },[game])

  

  return (
    <>
    <title>Astarion</title>
            <div style={{width: '35rem', display: 'block',marginLeft: 'auto', marginRight: 'auto', marginTop: '5rem', marginBottom: '5rem'}}>
                <Chessboard position={game.fen()} id="BasicBoard" onPromotionPieceSelect={promocheck} onPieceDrop={onDrop} boardOrientation={color.current} />
            </div>

        </>
  );
}

export default App;
