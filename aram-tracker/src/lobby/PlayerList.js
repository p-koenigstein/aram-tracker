import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import React from "react";


export function PlayerList({players, startGame}) {

    return (
        <div className={"horiz defaultPadding"}>
            <div className={"horiz"}>
                <h2>Lobby</h2>
            </div>
            <ListGroup className={"playerList"}>
                {players.map((player) =>
                    <ListGroupItem key={player}>
                        {player}
                    </ListGroupItem>
                )}
            </ListGroup>
            <div className={"horiz defaultPadding"}><Button onClick={startGame}>Spiel starten</Button></div>
        </div>
    )
}
