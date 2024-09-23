import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {PlayerList} from "./PlayerList";
import ChampionSelect from "../champselect/ChampionSelect";
import {HeadsUp} from "../champselect/HeadsUp";
import {MatchSummary} from "./MatchSummary";
import {Match} from "../matchhistory/MatchHistory";

export function Lobby ({username}) {

    const [players, setPlayers] = useState([])
    const [team, setTeam] = useState({})
    const [status, setStatus] = useState("lobby")
    const [started, setStarted] = useState(false)
    const [availableChamps, setAvailableChamps] = useState([])
    const [completeDraft, setCompleteDraft] = useState([])
    const [draftComplete, setDraftComplete] = useState(false)
    const [teamNames, setTeamNames] = useState([])
    const [lastGame, setLastGame] = useState({})
    const [inLobby, setInLobby] = useState(false);


    useEffect(() => {
        setInLobby(players.includes(username))
    }, [username, players]);

    const WS_URL = process.env.REACT_APP_WS_URL;
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
            switch (lastJsonMessage.action){
                case "playerList":
                    console.log(lastJsonMessage.payload)
                    let currentPlayers = Object.keys(lastJsonMessage.payload.players).map(
                        ((key) => lastJsonMessage.payload.players[key].username)
                    )
                    console.log(currentPlayers)
                    setPlayers(currentPlayers)
                    setStatus(lastJsonMessage.payload.status)
                    break;
                case "updateStatus":
                    setStatus(lastJsonMessage.payload.status)
                    break;
                case "startGame":
                    payload = lastJsonMessage.payload
                    setAvailableChamps(payload.availableChamps)
                    setTeam(payload.team)
                    setStatus(payload.status)
                    // setStarted(true)
                    break;
                case "updateChamps":
                    payload = lastJsonMessage.payload
                    let newTeam = payload.team
                    setTeam(newTeam)
                    break;
                case "finishDraft":
                    payload = lastJsonMessage.payload
                    setCompleteDraft(payload.teams)
                    setDraftComplete(true)
                    setStatus(payload.status)
                    break;
                case "gameFinish":
                    payload = lastJsonMessage.payload
                    setTeamNames(payload.teamNames)
                    break;
                case "updateLatestMatch":
                    setLastGame(lastJsonMessage.payload)
                    break;
                default:
                    console.log(lastJsonMessage)
                    break;
            }
        }
    },[lastJsonMessage])

    const joinGame = () => {
        sendJsonMessage({action:"joinLobby"})
    }

    const startGame = () => {
        sendJsonMessage({action:"startGame"})
    }

    const selectChampion = (champName) => {
        sendJsonMessage({action:"selectChampion",payload:{champName:champName}})
    }

    const confirmChampion = () => {
        sendJsonMessage({action:"confirmChampion", payload:{}})
    }

    console.log("Status: "+status)
    switch (status) {
        case "lobby":
            return <div>
                {Object.keys(lastGame).length >0 ? (<div className={"matchHistoryEntry"}>

                    <h3 className={"matchHistoryEntry"}>Last Match:</h3>
                    <Match match={lastGame}/>
                </div>) : <div/>}
                    <PlayerList players={players} startGame={startGame} joinGame={joinGame} started={false} inLobby={inLobby}/>
            </div>
        case "draft":
            return <div>
                {inLobby ?
                <ChampionSelect username={username} playerAmount={Object.keys(team).length} selectChampion={selectChampion} availableChampions={availableChamps} players={team} confirmChampion={confirmChampion}/>
                :
                    <PlayerList players={players} startGame={startGame} joinGame={joinGame} started={true} inLobby={inLobby}/>
                }
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