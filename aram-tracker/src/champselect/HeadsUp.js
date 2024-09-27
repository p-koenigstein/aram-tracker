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
            <div>
            {
                teams.map(
                    (team,idx) => {
                        return <div className="team" key={idx}>
                            {team.map((player) => {
                                    return <PlayerSlot selectedChamp={team[player].state.selectedChampion}
                                                       playerName={team[player].username} key={team[player].username}
                                                       lockedIn={false}/>
                                }
                            )}
                        </div>
                    }
                )
            }
            </div>
            {teamNames.length ===2? (
                <div className={"winButtonContainer"}>
                    Welches Team hat gewonnen? <br/>
                    <Button disabled={voted} onClick={() => vote(0)}>
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