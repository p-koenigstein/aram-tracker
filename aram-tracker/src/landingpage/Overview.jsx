import Lobby from "../lobby/Lobby";
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";


export function Overview ({userName}) {
    return (
        <div>
            <Button as="a" href="/leaderboard" variant={"success"}>Rangliste</Button>
            <Button href="/matchhistory">Match History</Button>
            <Button href="/lobby">Lobby</Button>
        </div>
    )
}