import {
    checkLobbyAlive,
    checkStartCondition, createLobby, endGame,
    joinLobby,
    lockInChampion,
    selectChampion,
    shuffleTeams,
    startChampSelect,
    startGame
} from "./lobby/lobbies.js"
import {getElos, getLatestMatch, getMatchHistory, getPlayerMatchHistory, getRanking} from "./database/database.js";
import {WebSocketServer} from 'ws'
import url from 'url'
import http from 'http'
import {v4 as uuidv4} from 'uuid'
const server = http.createServer()

const wsServer = new WebSocketServer({server})
const port = 8000

let connections = {

}

let playersByName = {

}

let playersByUuid = {

}

let lastMatch = {}

const broadcast = (message, targets) => {
    targets.forEach((uuid) => {
            let connection = connections[uuid]
            connection.send(JSON.stringify(message))
            updateUserStatus(uuid)
        })
}

const handleMessage = (bytes, uuid) => {
    const request = JSON.parse(bytes.toString())
    let message = {}
    let lobbyId
    let lobby
    let player
    switch (request["action"]) {
        case "register":
            message.action = "playersOnline"
            message.payload = {
                players:getPlayerList()
            }
            broadcast(message, Object.keys(playersByUuid))
            broadcast({
                action:"updateLatestMatch",
                payload:lastMatch
                },[uuid])
            break;
        case "createLobby":
            console.log(request)
            lobbyId = createLobby(playersByUuid[uuid].username)
            broadcast({
                action:"createLobby",
                payload:{
                    lobbyId
                }
            },[uuid])
            break;
        case "joinLobby":
            console.log(request)
            lobbyId = request.payload.lobbyId
            lobby = joinLobby(playersByUuid[uuid], lobbyId)
            if (lobby){
                message.action = "updatePlayers"
                message.payload = lobby.players
                broadcast(message, lobby.players.map((player) => player.uuid))
                broadcast({
                    action:"joinLobby",
                    payload:{
                        lobbyId
                    }
                },[uuid])
            }
            break;
        case "shuffleTeams":
            lobbyId = playersByUuid[uuid].inLobby
            if (lobbyId ===""){
                break;
            }
            lobby = shuffleTeams(lobbyId)
            if (lobby) {
                message.action = "displayTeams"
                message.payload = {
                    teams : lobby.teams,
                    status : lobby.status
                }
                broadcast(message, lobby.players.map((player) => player.uuid))
            }
            break;
        case "startGame":
            lobbyId = playersByUuid[uuid].inLobby
            lobby = startChampSelect(lobbyId)
            if (lobby) {
                message.action = "startGame"
                for (let team = 0; team< 2; team++){
                    message.payload = {
                        team : lobby.teams[team],
                        champs : lobby.champs[team],
                        status : lobby.status
                    }
                    broadcast(message, lobby.teams[team].map((player) => player.uuid))
                }
            }
            break;
        case "selectChampion":
            player = playersByUuid[uuid]
            lobby = selectChampion(player.username, player.state.inLobby, request.payload.champName)
            if (lobby) {
                let recipients =lobby.teams[player.state.team].map((player) => player.uuid)
                message.action = "updateChamps"
                message.payload = {}
                message.payload.team = lobby.teams[player.state.team]
                broadcast(message, recipients)
            }
            break;
        case "confirmChampion":
            player = playersByUuid[uuid]
            lobby = lockInChampion(player.username, player.state.inLobby)
            if(lobby){
                let gameReady = checkStartCondition(player.state.inLobby)
                if (gameReady) {
                    message.action = "finishDraft"
                    message.payload = {}
                    message.payload.status = "game"
                    message.payload.teams = lobby.teams
                    broadcast(message, lobby.players.map((player) => player.uuid))
                    setTimeout(() => {displayWinnerButtons()}, process.env.GAME_END_DELAY)
                }
                else {
                    message.action = "updateChamps"
                    message.payload = {
                        teams : lobby.teams[player.state.team]
                    }
                    broadcast(message, lobby.teams[player.state.team].map((user) => user.uuid))
                }
            }
            break;
        case "vote":
            let vote = request.payload.team;
            lobbyId = playersByUuid[uuid].state.inLobby
            lastMatch = endGame(lobbyId, vote)
            sendLatestMatch()
            break;
        case "requestMatchHistory":
            getMatchHistory(uuid).then(
                (allMatches) => {
                    message = {
                        action: "matchHistory",
                        payload: {
                            matches: allMatches
                        }
                    }
                    connections[uuid].send(JSON.stringify(message))
                })
            break;
        case "requestLeaderboard":
            getRanking()
                .then(
                    (ranking) => {
                        message = {
                            action:"leaderBoardAnswer"
                        }
                        message.payload = ranking
                        connections[uuid].send(JSON.stringify(message))
                    }
                )
            break;
        case "requestProfile":
            let requestedPlayer = request.payload.player
            if (requestedPlayer===null){
                requestedPlayer = playersByUuid[uuid].username
            }
            getPlayerMatchHistory(requestedPlayer)
                .then((history) => {
                    message = {
                        action:"profileAnswer",
                        payload:history
                    }
                    connections[uuid].send(JSON.stringify(message))
                })
            break;
        default:
            console.log(request)
            break;
    }
}

const getPlayerList = () =>{
    return Object.entries(playersByName).filter(([name, playerObject]) => playerObject.state.online).map(([name, playerObject]) => name)
}

const sendLatestMatch = () => {
    if(lastMatch){
        let message = {
            action:"updateLatestMatch"
        }
        message.payload = lastMatch
        broadcast(message, Object.keys(playersByUuid))
    }
}


const displayWinnerButtons = () =>{
    let message = {}
    message.action = "gameFinish"
    message.payload ={}
    message.payload.teamNames = teams.map(team => {
        let teamLeader = Object.keys(team).sort((p1,p2) => 0.5 - Math.random())[0]
        return "Team "+team[teamLeader].username
    })
    broadcast(message, Object.keys(playersByUuid))
}

const handleClose = (uuid) => {
    let player = playersByUuid[uuid]
    delete connections[uuid]
    playersByUuid[uuid].uuid = ""
    delete playersByUuid[uuid]
    if (player.state.inLobby !== ""){
        checkLobbyAlive(player.state.inLobby)
    }
}

const createPlayer = (uuid, username) => {
    return {
        username,
        uuid,
        state: getDefaultPlayerState()
    }
}


const getDefaultPlayerState = () => {
    return {
        selectedChampion:"",
        lockedIn:false,
        team:-1,
        inLobby: "",
        online:false
    }
}

const updateUserStatus = (uuid) => {
    let message = {
        action:"register",
        payload:playersByUuid[uuid].state.inLobby
    }
    connections[uuid].send(JSON.stringify(message))
}

wsServer.on("connection", (connection, request) => {
    const { username } = url.parse(request.url, true).query
    if (username) {
        const uuid = uuidv4()
        let player
        if (Object.keys(playersByName).includes(username)) {
            player = playersByName[username];
            player.state.online = true
        } else {
            player = createPlayer(uuid, username)
            playersByName[username] = player
        }
        playersByUuid[uuid] = player
        connections[uuid] = connection
        getElos(username)
            .then(
                (elos) => {
                    player.elo = elos.elo
                    player.elo1v1 = elos.elo1v1
                }
            )
        updateUserStatus(uuid)
        connection.on("message", message => handleMessage(message, uuid))
        connection.on("close", () => handleClose(uuid))
    }
})

getLatestMatch()
    .then((match) => lastMatch=match)

server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`)
})