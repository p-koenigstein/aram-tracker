import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import React from "react";


export function PlayerList({players, startGame}) {

    return (
        <div>
            <ListGroup>
                {players.map((player) =>
                    <ListGroupItem key={player}>
                        {player}
                    </ListGroupItem>
                )}
            </ListGroup>
            <Button onClick={startGame}>Spiel starten</Button>
        </div>
    )
}
