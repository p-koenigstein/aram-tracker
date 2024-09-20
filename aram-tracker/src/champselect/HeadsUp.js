import React, {useEffect, useState} from "react";
import {PlayerSlot} from "./ChampionSelect";
import useWebSocket from "react-use-websocket";
import {Button} from "react-bootstrap";


export function HeadsUp ({teams, teamNames}) {

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
            {teamNames.length ===2? (
                <div><Button>
                {teamNames[0]}
            </Button>
            <Button>
                {teamNames[1]}
            </Button>
            </div>
            ):<div/>}
        </div>
    )
}