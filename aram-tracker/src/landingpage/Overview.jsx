import Lobby from "../lobby/Lobby";
import {Button} from "react-bootstrap";


export function Overview ({userName}) {
    return (
        <div>
            <Button href="/leaderboard">Rangliste</Button>
            <Button hfref="/matchhistory">Match History</Button>
            <Button href="/lobby" >Lobby</Button>
        </div>
    )
}