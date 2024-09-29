import {
    checkLobbyAlive,
    checkStartCondition, createLobby, endGame, getLobby, getTeamNames,
    joinLobby,
    lockInChampion,
    selectChampion,
    shuffleTeams,
    startChampSelect,
    startGame, toggleFearless
} from "./lobby/lobbies.js"
import {
    getElos,
    getLatestMatch,
    getMatchHistory,
    getPlayerMatchHistory,
    getPlayerProfile,
    getRanking
} from "./database/database.js";
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
            if (connection){
                connection.send(JSON.stringify(message))
                updateUserStatus(uuid)
            }
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
            lobby = createLobby(playersByUuid[uuid].username, playersByUuid[uuid])
            playersByUuid[uuid].state.inLobby = lobby.lobbyId
            broadcast({
                action:"createLobby",
                payload:{
                    lobby
                }
            },[uuid])
            break;
        case "joinLobby":
            lobbyId = request.payload.lobbyId
            lobby = joinLobby(playersByUuid[uuid], lobbyId)
            if (lobby){
                playersByUuid[uuid].state.inLobby = lobbyId
                message.action = "updatePlayers"
                message.payload = {
                    lobby
                }
                broadcast(message, lobby.players.map((player) => player.uuid))
                broadcast({
                    action:"joinLobby",
                    payload:{
                        lobby
                    }
                },[uuid])
            }
            break;
        case "toggleFearless":
            lobbyId = playersByUuid[uuid].state.inLobby
            lobby = toggleFearless(lobbyId, playersByUuid[uuid].username)
            if(lobby) {
                message.action = "updatePlayers"
                message.payload = {
                    lobby
                }
                broadcast(message, lobby.players.map((player) => player.uuid))
            }
            break;
        case "shuffleTeams":
            lobbyId = playersByUuid[uuid].state.inLobby
            console.log(lobbyId)
            if (lobbyId === ""){
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
            lobbyId = playersByUuid[uuid].state.inLobby
            lobby = startChampSelect(lobbyId)
            console.log(lobby)
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
                let recipients = lobby.teams[player.state.team].map((player) => player.uuid)
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
                    setTimeout(() => {displayWinnerButtons(lobby.lobbyId)}, process.env.GAME_END_DELAY)
                }
                else {
                    message.action = "updateChamps"
                    message.payload = {
                        team : lobby.teams[player.state.team]
                    }
                    broadcast(message, lobby.teams[player.state.team].map((user) => user.uuid))
                }
            }
            break;
        case "vote":
            let vote = request.payload.team;
            lobbyId = playersByUuid[uuid].state.inLobby
            lastMatch = endGame(lobbyId, vote)
            lobby = getLobby(lobbyId)
            message.action = "returnToLobby"
            message.payload = {
                lobby
            }
            sendLatestMatch()
            broadcast(message, lobby.players.map((player) => player.uuid))
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
            getPlayerProfile(requestedPlayer)
                .then((profile) => {
                    message = {
                        action:"profileAnswer",
                        payload:profile
                    }
                    console.log(message)
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


const displayWinnerButtons = (lobbyId) =>{
    let message = {}
    message.action = "gameFinish"
    message.payload = {}
    message.payload.teamNames = getTeamNames(lobbyId)
    broadcast(message, Object.keys(playersByUuid))
}

const handleClose = (uuid) => {
    let player = playersByUuid[uuid]
    console.log("disconnect ", uuid, player.username)
    delete connections[uuid]
    playersByUuid[uuid].uuid = ""
    delete playersByUuid[uuid]
    if (player.state.inLobby !== ""){
        player.state.online = false
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
        online:true
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