import React, {useEffect, useState} from "react";
import {PlayerSlot} from "./ChampionSelect";
import useWebSocket from "react-use-websocket";
import {Button} from "react-bootstrap";


export function HeadsUp ({teams, teamNames, sendJsonMessage}) {

    const [voted, setVoted] = useState(false);


    const vote = (team) => {
        sendJsonMessage({action:"vote", payload:{team:team}})
        setVoted(true)
        console.log("voted")
    }

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
                <div><Button disabled={voted} onClick={() => vote(0)}>
                {teamNames[0]}
            </Button>
            <Button disabled={voted} onClick={() => vote(1)}>
                {teamNames[1]}
            </Button>
            </div>
            ):<div/>}
        </div>
    )
}