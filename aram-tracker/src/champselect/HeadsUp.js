import React from "react";
import {PlayerSlot} from "./ChampionSelect";


export function HeadsUp ({teams}) {

    return (
        <div>
            {
                teams.map(
                    (team) => <div className="team" key={team}>
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