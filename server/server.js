import {
    checkLobbyAlive,
    checkStartCondition,
    joinLobby,
    lockInChampion,
    selectChampion,
    shuffleTeams,
    startChampSelect,
    startGame
} from "./lobby/lobbies"

const {WebSocketServer} = require('ws')
const url = require('url')
const http = require("http");
const uuidv4 = require("uuid").v4
const server = http.createServer()

const wsServer = new WebSocketServer({server})
const port = 8000

let connections = {

}

let playersByName = {

}

let playersByUuid = {

}

const broadcast = (message, targets) => {
    targets.map((uuid) => connections[uuid])
        .for((connection) => {
            connection.send(JSON.stringify(message))
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
            message = getPlayerList()
            broadcast(message)
            break;
        case "joinLobby":
            lobbyId = request.payload.lobbyId
            lobby = joinLobby(playersByUuid[uuid], lobbyId)
            if (lobby){
                message.action = "updatePlayers"
                message.payload = lobby.players
                broadcast(message, lobby.players.map((player) => player.uuid))
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
            let dbEntry = {
                winner:vote
            }
            dbEntry.teams = []
            teams.forEach(team =>{
                    dbEntry.teams.push(Object.keys(team).map((uuid) => {
                        return {
                            username : players[uuid].username,
                            champName: players[uuid].state.selectedChampion
                        }
                    }))
                }
            )
            let elos = teams.map((team) => {
                return (Object.entries(team).map(([playerUuid, player]) => player.elo).reduce((a,b) => a+b)/Object.entries(team).length)
            })
            let probabilities = elos.map((elo, idx) => {
                return (1 / (1 + Math.pow(10, ((elo - elos[(idx + 1) % 2]) / 400))))
            })
            const K = 30
            console.log(probabilities[0],probabilities[1])
            let eloChange = [K * ((1-vote)-probabilities[1]), K * ((1-(1-vote)-probabilities[0]))]
            //      let eloChange = probablilites.map((prob) => K * ((1 - vote)-prob))
            teams.forEach((team,index) => {
                let teamPlayers = Object.entries(team).map(([uuid, player]) => {
                    player.elo = player.elo + eloChange[index]
                    return player.username
                })
                updateElo(teamPlayers, eloChange[index])
            })
            console.log(probabilities)
            console.log(elos)
            console.log(eloChange)
            dbEntry.timestamp = new Date(Date.now()).toISOString()
            writeDB(dbEntry)
                .then(result => {
                    console.log(result)
                    let matchId = result.insertedId
                    console.log(matchId)
                    appendMatch(matchId, dbEntry)
                        .then(result => {})
                        .catch(err => console.log(err))
                })
                .catch(error => {console.log(error)})
            lastMatch = dbEntry
            sendLatestMatch()
            endGame()
            break;
        case "requestMatchHistory":
            getMatchHistory(uuid)
            break;
        case "requestLeaderboard":
            getRanking()
                .then(
                    (ranking) => {
                        message = {
                            action:"leaderBoardAnswer"
                        }
                        message.payload = ranking
                        console.log(message)
                        connections[uuid].send(JSON.stringify(message))
                    }
                )
            break;
        case "requestProfile":
            let requestedPlayer = request.payload.player
            if (requestedPlayer===null){
                requestedPlayer = players[uuid].username
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


const displayWinnerButtons = () =>{
    let message = {}
    message.action = "gameFinish"
    message.payload ={}
    message.payload.teamNames = teams.map(team => {
        let teamLeader = Object.keys(team).sort((p1,p2) => 0.5 - Math.random())[0]
        return "Team "+team[teamLeader].username
    })
    broadcast(message)
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

wsServer.on("connection", (connection, request) => {
    const { username } = url.parse(request.url, true).query
    const uuid = uuidv4()
    const player = createPlayer(uuid, username)
    playersByName[username] = player
    playersByUuid[uuid] = player
    connections[uuid] = connection
    connection.on("message", message => handleMessage(message, uuid))
    connection.on("close", () => handleClose(uuid))
})
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`)
})