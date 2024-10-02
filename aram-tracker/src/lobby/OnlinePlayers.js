import {Button, ListGroup, ListGroupItem} from "react-bootstrap";

export const OnlinePlayers = ({username, players, joinLobby}) =>{

    return (
        <div className={"onlinePlayers"}>
            Online players:
            <ListGroup>
                {players.filter((player) => player.username!==username).map((player) => (
                    <ListGroupItem>
                        {player.username}&nbsp;&nbsp;{player.inLobby!=="" && <Button variant={"outline-success"} onClick={()=> joinLobby(player.inLobby)}>join</Button>}
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    )
}