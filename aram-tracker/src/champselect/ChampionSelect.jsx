import '../App.css';
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Button} from "react-bootstrap";



function ChampionSelect({username, availableChampions, players, selectChampion, confirmChampion}) {

    const [buttonDisabled,setButtonDisabled] = useState(true);

    useEffect(() => {
        let playerObj = Object.values(players).find((player) =>{
            return player.username===username
        })
        if(playerObj.state.lockedIn || playerObj.state.selectedChampion===""){
            setButtonDisabled(true)
        }
        else{
            setButtonDisabled(false)
        }
    },[username, players])

  return (
    <div className="champSelect">
      <div className="players borderRadius">
          {Object.keys(players).map((player) =>
                <PlayerSlot selectedChamp={players[player].state.selectedChampion} playerName={players[player].username} key={player} lockedIn={players[player].state.lockedIn}/>
          )}
      </div>
        <div className={"selectionActions"}>
      <div className="availableChampions">
          {availableChampions.map((champion) =>
           <ChampionIcon champ={champion} onClick={() => selectChampion(champion)} disable={false} key={champion}/>
          )}
      </div>
        <div className={"confirmButton"}>
        <Button onClick={() => confirmChampion()} variant={"success"} disabled={buttonDisabled}>
            Auswahl bestätigen
        </Button>
        </div>
        </div>
    </div>
  );
}


function ChampionIcon ({champ, onClick}) {
    if (champ==="" || champ=== undefined){
    return (<div className="championIconWrapper">
            <img src={require("../resources/champs/None.png")} alt={champ} className="championIcon" />
    </div>)
    }
    else{
    return (<div className="championIconWrapper">
            <img src={require("../resources/champs/"+champ.replaceAll('.','').replaceAll(' ','').replaceAll("_","")+"_0.jpg")} alt={champ} className="championIcon" onClick={() => onClick()}/>
    </div>)
    }
}

export function PlayerSlot ({selectedChamp, playerName, lockedIn})  {
    return <div className={"playerSlot "+ (lockedIn ? "lockedIn" : "")}>
        <div><ChampionIcon champ={selectedChamp}  onClick={() => {}}/></div>
        <div className={"playerName"}>{playerName}</div>
    </div>
}
export default ChampionSelect;
