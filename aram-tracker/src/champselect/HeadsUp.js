import React from "react";
import {PlayerSlot} from "./ChampionSelect";


export function HeadsUp ({teams}) {

    console.log(teams)
    console.log(Object.keys(teams[0]))
    console.log(teams[0][Object.keys(teams[0])].state)
    return (
        <div>
            {
                teams.map(
                    (team) => <div className="team">
                        {Object.keys(team).map((player) =>
                            <PlayerSlot selectedChamp={team[player].state.selectedChampion}
                                        playerName={team[player].username} key={player}
                                        lockedIn={team[player].state.lockedIn}/>
                        )}
                    </div>
                )
            }
        </div>
    )
}