import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import React, {useEffect, useState} from "react";


export function PlayerList({inLobby, players, startGame, joinGame, started}) {

    const [buttonText, setButtonText] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        if(!inLobby){
            if(started) {
                setButtonText("Champions werden ausgewählt")
                setButtonDisabled(true)
            }
            else{
                setButtonDisabled(false)
                setButtonText(outLobbyText)
            }
        }
        else{
            setButtonDisabled(false)
            setButtonText(inLobbyText)
        }

    }, [started, inLobby]);

    const inLobbyText = "Spiel starten"
    const outLobbyText = "Lobby beitreten"

    return (
        <div className={"horiz defaultPadding"}>
            <div className={"horiz"}>
                <h2>Lobby</h2>
            </div>
            <ListGroup className={"playerList"}>
                {players.length > 0 && players.map((player) =>
                    <ListGroupItem key={player}>
                        {player}
                    </ListGroupItem>
                )}
                {
                    players.length === 0 &&
                    <ListGroupItem className={"unselectable"} variant={"dark"}>
                        Sehr leer hier ....
                    </ListGroupItem>
                }
            </ListGroup>
            <div className={"horiz defaultPadding"}>
                <Button
                    onClick={inLobby ? startGame : joinGame}
                    variant={inLobby ? "outline-warning" : "outline-success"}
                    disabled={buttonDisabled}
                >{buttonText}</Button>
            </div>
        </div>
    )
}
