import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {PlayerList} from "./PlayerList";
import ChampionSelect from "../champselect/ChampionSelect";
import './ChampSelecct.css'
import {HeadsUp} from "../champselect/HeadsUp";
import {MatchSummary} from "./MatchSummary";

export function Lobby ({username}) {
    const WS_URL = process.env.REACT_APP_WS_URL;

    const [players, setPlayers] = useState([])
    const [team, setTeam] = useState({})
    const [status, setStatus] = useState("lobby")
    const [started, setStarted] = useState(false)
    const [availableChamps, setAvailableChamps] = useState([])
    const [completeDraft, setCompleteDraft] = useState([])
    const [draftComplete, setDraftComplete] = useState(false)
    const [teamNames, setTeamNames] = useState([])
    const [lastGame, setLastGame] = useState({})

    console.log(WS_URL)

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
                    let currentPlayers = Object.keys(lastJsonMessage.payload.players).map(
                        ((key) => lastJsonMessage.payload.players[key].username)
                    )
                    setPlayers(currentPlayers)
                    setLastGame(lastJsonMessage.payload.lastMatch)
                    console.log(lastJsonMessage)
                    setStatus("lobby")
                    break;
                case "startGame":
                    ///TODO
                    payload = lastJsonMessage["payload"]
                    console.log(payload)
                    setAvailableChamps(payload["availableChamps"])
                    setTeam(payload["team"])
                    setStatus("draft")
                    // setStarted(true)
                    break;
                case "updateChamps":
                    payload = lastJsonMessage["payload"]
                    let newTeam = payload.team
                    setTeam(newTeam)
                    break;
                case "finishDraft":
                    payload = lastJsonMessage["payload"]
                    console.log(lastJsonMessage)
                    setCompleteDraft(payload.teams)
                    setDraftComplete(true)
                    setStatus("game")
                    break;
                case "gameFinish":
                    payload = lastJsonMessage["payload"]
                    setTeamNames(payload.teamNames)
                    break;
                default:
                    console.log(lastJsonMessage)
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

    const confirmChampion = () => {
        sendJsonMessage({action:"confirmChampion", payload:{}})
    }

    console.log(status)
    switch (status) {
        case "lobby":
            return <div>
                {Object.keys(lastGame).length >0 ? (<MatchSummary lastMatch={lastGame}/>) : <div/>}
                <PlayerList players={players} startGame={startGame}/>
            </div>
        case "draft":
            return <div>
                <ChampionSelect playerAmount={Object.keys(team).length} selectChampion={selectChampion} availableChampions={availableChamps} players={team} confirmChampion={confirmChampion}/>
            </div>
        case "game":
            return <div>
                <HeadsUp teams={completeDraft} teamNames={teamNames} sendJsonMessage={sendJsonMessage}/>
            </div>
        default:
            <div/>
    }
}

export default Lobby