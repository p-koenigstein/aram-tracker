import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import React, {useEffect, useState} from "react";


export function PlayerList({username, players, startGame, joinGame}) {

    const [inLobby, setInLobby] = useState(false);

    const inLobbyText = "Spiel starten"
    const outLobbyText = "Lobby beitreten"

    useEffect(() => {
        setInLobby(players.includes(username))
    }, [username, players]);

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
                    <ListGroupItem variant={"dark"} unselectable={true}>
                        Sehr leer hier ....
                    </ListGroupItem>
                }
            </ListGroup>
            <div className={"horiz defaultPadding"}><Button onClick={inLobby ? startGame : joinGame}>{inLobby ? inLobbyText : outLobbyText}</Button></div>
        </div>
    )
}
