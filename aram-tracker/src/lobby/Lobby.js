import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {PlayerList} from "./PlayerList";
import ChampionSelect from "../champselect/ChampionSelect";

export function Lobby ({username}) {

    const WS_URL = 'ws://127.0.0.1:8000'

    const [players, setPlayers] = useState([])
    const [team, setTeam] = useState({})
    const [started, setStarted] = useState(false)
    const [availableChamps, setAvailableChamps] = useState([])

    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        sendJsonMessage({action:"register"})
    }, []);

    useEffect(() => {
        // console.log(currentPlayers)
        if (lastJsonMessage !== null){
            let payload
            switch (lastJsonMessage["action"]){
                case "playerList":
                    let currentPlayers = Object.keys(lastJsonMessage["payload"]).map(
                        ((key) => lastJsonMessage["payload"][key]["username"])
                    )
                    setPlayers(currentPlayers)
                    break;
                case "startGame":
                    ///TODO
                    payload = lastJsonMessage["payload"]
                    console.log(payload)
                    setAvailableChamps(payload["availableChamps"])
                    setTeam(payload["team"])
                    setStarted(true)
                    break;
                case "updateChamps":
                    payload = lastJsonMessage["payload"]
                    let newTeam = payload.team
                    setTeam(newTeam)
                    break;
                default:
                    break;
            }
        }
    },[lastJsonMessage])

    const startGame = () => {
        console.log("starting mgae")
        sendJsonMessage({action:"startGame"})
    }

    const selectChampion = (champName) => {
        console.log("selecting Champ")
        sendJsonMessage({action:"selectChampion",payload:{champName:champName}})
    }

    return (
        <div>
            {started ? (<ChampionSelect playerAmount={Object.keys(team).length} selectChampion={selectChampion} availableChampions={availableChamps} players={team}/>)
                :
                (<PlayerList players={players} startGame={startGame}/>)
            }
        </div>
    )
}

export default Lobby