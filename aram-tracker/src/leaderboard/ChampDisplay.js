import React from "react";
import {ChampionIcon} from "../champselect/ChampionSelect";


export const ChampDisplay = ({champName, stats, isTeammate}) =>{

    return <div className={"champEntry" } >
        <div><ChampionIcon champ={champName}  onClick={() => {}}/></div>
        <div className={"paddingLeft"}>{Math.round(stats.winRate*100)}% ({stats.won}-{stats.lost})</div>
    </div>

}