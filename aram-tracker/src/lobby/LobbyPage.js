import {Button, ListGroup, ListGroupItem} from "react-bootstrap";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {PlayerList} from "./PlayerList";
import ChampionSelect from "../champselect/ChampionSelect";
import {HeadsUp} from "../champselect/HeadsUp";
import {MatchSummary} from "./MatchSummary";
import {Match} from "../matchhistory/MatchHistory";
import {LobbyPreview} from "./LobbyPreview";
import {PreLobby} from "./PreLobby";
import {Switch, useRadioGroup} from "@mui/material";
import {OnlinePlayers} from "./OnlinePlayers";

export function LobbyPage ({username}) {

    const [onlinePlayers, setOnlinePlayers] = useState([])
    const [playerLobby, setPlayerLobby] = useState({})
    const [inLobby, setInLobby] = useState(false)
    const [players, setPlayers] = useState([])
    const [team, setTeam] = useState({})
    const [teams, setTeams] = useState([])
    const [status, setStatus] = useState("lobby")

    const [availableChamps, setAvailableChamps] = useState([])
    const [completeDraft, setCompleteDraft] = useState([])

    const [teamNames, setTeamNames] = useState([])
    const [lastGame, setLastGame] = useState({})

    const WS_URL = process.env.REACT_APP_WS_URL;
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        console.log(playerLobby)
        console.log(Object.keys(playerLobby))
        setInLobby(Object.keys(playerLobby).length !== 0)
    },[playerLobby])

    const createLobby = () => {
        sendJsonMessage({
            action:"createLobby"
        })
    }

    const joinLobby = (lobbyId) => {
        sendJsonMessage({
            action:"joinLobby",
            payload:{
                lobbyId
            }
        })
    }

    const leaveLobby = () => {
        sendJsonMessage({
            action:"leaveLobby"
        })
        setPlayerLobby({})
        setInLobby(false)
    }

    const shuffleTeams = () => {
        sendJsonMessage({action:"shuffleTeams"})
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

    const toggleFearless = () => {
        sendJsonMessage({action:"toggleFearless"})
    }

    useEffect(() => {
        sendJsonMessage({action:"reloadLobby"})
    }, []);

    useEffect(() => {
        // console.log(currentPlayers)
        if (lastJsonMessage !== null){
            let payload
            switch (lastJsonMessage.action){
                case "updateLobby":
                    console.log("updateLobby")
                    console.log(lastJsonMessage.payload)
                    if(Object.keys(lastJsonMessage.payload).length > 0){
                        setPlayerLobby(lastJsonMessage.payload.lobby)
                    }
                    break;
                case "playerlist":
                    console.log(lastJsonMessage)
                    setOnlinePlayers(lastJsonMessage.payload.players)
                    break;
                case "createLobby":
                    console.log("createLobby")
                    console.log(lastJsonMessage)
                    setPlayerLobby(lastJsonMessage.payload.lobby)
                    break;
                case "joinLobby":
                    console.log("joinLobby")
                    setPlayerLobby(lastJsonMessage.payload.lobby)
                    break;
                case "updatePlayers":
                    console.log("updatePlayers")
                    setPlayerLobby(lastJsonMessage.payload.lobby)
                    break;
                case "playerList":
                    let currentPlayers = Object.keys(lastJsonMessage.payload.players).map(
                        ((key) => lastJsonMessage.payload.players[key].username)
                    )
                    setPlayers(currentPlayers)
                    setStatus(lastJsonMessage.payload.status)
                    break;
                case "updateStatus":
                    setStatus(lastJsonMessage.payload.status)
                    break;
                case "startGame":
                    payload = lastJsonMessage.payload
                    setAvailableChamps(payload.champs)
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
                    setStatus(payload.status)
                    break;
                case "gameFinish":
                    payload = lastJsonMessage.payload
                    setTeamNames(payload.teamNames)
                    break;
                case "updateLatestMatch":
                    setLastGame(lastJsonMessage.payload)
                    break;
                case "returnToLobby":
                    console.log("returnToLobby")
                    setStatus(lastJsonMessage.payload.lobby.status)
                    setPlayerLobby(lastJsonMessage.payload.lobby)
                    break;
                case "displayTeams":
                    setStatus(lastJsonMessage.payload.status)
                    setTeams(lastJsonMessage.payload.teams)
                    break;
                default:
                    break;
            }
        }
    },[lastJsonMessage])


    const lastMatch = (<div>
        {Object.keys(lastGame).length > 0 ? (<div className={"matchHistoryEntry"}>
                <h3 className={"matchHistoryEntry"}>Last Match:</h3>
                <Match match={lastGame}/>
            </div>) : <div/>}
        </div>
    )

    if (!inLobby){
        return (<div>
            {lastMatch}
            <PreLobby createLobby={createLobby} joinLobby={joinLobby} username={username}/>
            <OnlinePlayers username={username} players={onlinePlayers} joinLobby={joinLobby}/>
        </div>)
    }
    console.log(inLobby)
    console.log(playerLobby)
    switch (status) {
        case "lobby":
            return <div>
                {lastMatch}
                <h2 className={"matchHistoryEntry"}>Lobby</h2>
                <div className={"matchHistoryEntry"}>
                <h4>Invite-code:  {playerLobby.lobbyId} </h4><h5> Fearless Mode<Switch checked={playerLobby.fearless} onChange={() => toggleFearless()} disabled={username!==playerLobby.creator}/></h5>
                </div>
                <PlayerList players={playerLobby.players} startGame={shuffleTeams} leaveLobby={leaveLobby} started={false} inLobby={true}/>
            </div>
        case "teamSelect":
            return <div>
                {lastMatch}
                <h3 className={"matchHistoryEntry"}>Lobby {playerLobby.lobbyId}</h3>
                <LobbyPreview teams={teams} shuffle={shuffleTeams} startGame={startGame}/>
            </div>
        case "draft":
            return <div>
                <ChampionSelect username={username} playerAmount={team.length} selectChampion={selectChampion} availableChampions={availableChamps} players={team} confirmChampion={confirmChampion}/>
                </div>
        case "game":
            return <div>
                <HeadsUp teams={completeDraft} teamNames={teamNames} sendJsonMessage={sendJsonMessage}/>
            </div>
        default:
            <div/>
    }
}
