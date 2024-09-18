import '../App.css';
import './ChampSelecct.css'
import React, {useEffect, useState} from "react";
import axios from "axios";



function ChampionSelect({availableChampions, players, selectChampion}) {


  return (
    <div className="champSelect">
      <div className="players">
          {Object.keys(players).map((player) =>
                <PlayerSlot selectedChamp={players[player].state.selectedChampion} playerName={players[player].username} key={player}/>
          )}
      </div>
      <div className="availableChampions">
          {availableChampions.map((champion) =>
           <ChampionIcon champ={champion} onClick={() => selectChampion(champion)} disable={false} key={champion}/>
          )}
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

function PlayerSlot ({selectedChamp, playerName})  {
    return <div>
        <div><ChampionIcon champ={selectedChamp}  onClick={() => {}}/></div>
        <div className={"playerName"}>{playerName}</div>
    </div>
}
export default ChampionSelect;
