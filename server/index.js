

const http = require('http')
const {MongoClient} = require('mongodb')

const dbUrl = process.env.MONGODB_URI;
console.log(dbUrl)
const client = new MongoClient(dbUrl);
const dbName = 'aramTracker';

const {WebSocketServer} = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()

const wsServer = new WebSocketServer({server})
const port = 8000

let players = {}
let playerMapping = {}

let connections = {}

let gameCountdown = null

let teams = [{},{}]
let allChamps = [
    "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios",
    "Ashe", "Aurelion Sol", "Azir", "Bard", "Bel_Veth", "Blitzcrank", "Brand", "Braum", "Caitlyn",
    "Camille", "Cassiopeia", "Cho_Gath", "Corki", "Darius", "Diana", "Dr. Mundo", "Draven",
    "Ekko", "Elise", "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank",
    "Garen", "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Illaoi", "Irelia",
    "Ivern", "Janna", "Jarvan IV", "Jax", "Jayce", "Jhin", "Jinx", "K_Sante", "Kai_Sa", "Kalista",
    "Karma", "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Kha_Zix", "Kindred",
    "Kled", "Kog_Maw", "LeBlanc", "Lee Sin", "Leona", "Lillia", "Lissandra", "Lucian", "Lulu",
    "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi", "Milio", "Miss Fortune", "Mordekaiser",
    "Morgana", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nilah", "Nocturne", "Nunu",
    "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus",
    "Rek_Sai", "Rell", "Renata Glasc", "Renekton", "Rengar", "Riven", "Rumble", "Ryze", "Samira",
    "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion",
    "Sivir", "Skarner", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "Tahm Kench", "Taliyah",
    "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "Twisted Fate",
    "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vel_Koz", "Vex", "Vi", "Viego",
    "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin Zhao", "Yasuo",
    "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra", "Briar",
    "Naafiri", "Hwei", "Smolder", "Aurora"
]
let champs = []
let lastMatch = {}
let status = "lobby"

const handleMessage = (bytes, uuid) => {
    const request = JSON.parse(bytes.toString())
    let message = {}
    let team
    switch (request["action"]) {
        case "register":
            message = getPlayerList()
            broadcast(message)
            break;
        case "joinLobby":
            players[uuid].state.inLobby = true
            players[uuid].state.online = true
            console.log(players)
            console.log(getPlayerList())
            broadcast(getPlayerList())
            break;
        case "shuffleTeams":
            if (Object.keys(players).filter((uuid) => players[uuid].state.inLobby).length>1) {
                teams = [{},{}]
                const randomOrder = Object.keys(players).filter((player) => players[player].state.inLobby===true).sort((a, b) => 0.5 - Math.random())
                let current_team = 0
                for (let playerUUID in randomOrder) {
                    let currentUUID = randomOrder[playerUUID]
                    teams[current_team][currentUUID] = players[currentUUID]
                    players[currentUUID].state.team = current_team
                    current_team = (current_team + 1) % 2
                }
            }
            status = "teamSelect"
            message.action = "displayTeams"
            message.payload = {
                teams:teams,
                status:status
            }
            broadcast(message)
            break;
        case "startGame":
            if (Object.keys(players).filter((uuid) => players[uuid].state.inLobby && players[uuid].state.online).length>1) {
            message.action = "startGame"
                //shuffle keys
                getDraft()
                status = "draft"
                for (let team = 0; team < 2; team++) {
                    message.payload = getDraftUpdate(team)
                    broadcastTeam(message, team)
                }
                updateStatus()
            /// custom br

            }
            break;
        case "selectChampion":
            let request_pl = request.payload
            let champName = request_pl.champName
            team = players[uuid].state.team
            if (!teams[team][uuid].state.lockedIn){
                let selectedChampions = Object.keys(teams[team]).map((id) => teams[team][id].state.selectedChampion)
                if (!selectedChampions.includes(champName)) {
                    teams[team][uuid].state.selectedChampion = champName
                    message.action = "updateChamps"
                    message.payload = {}
                    message.payload.team = teams[team]
                    broadcastTeam(message, team)
                }
            }
            break;
        case "confirmChampion":
            if (players[uuid].state.selectedChampion !=="") {
                players[uuid].state.lockedIn = true
                team = players[uuid].state.team
                message.action = "updateChamps"
                message.payload = {}
                message.payload.team = teams[team]
                broadcastTeam(message, team)
                checkStartCondition()
            }
            break;
        case "vote":
            let vote = request.payload.team;
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

const updateElo = (playerList, eloChange) => {
    const eloFieldName = playerList.length === 1 ? "elo1v1" : "elo"
    client.connect()
        .then(() => {
            const db = client.db(dbName);
            const collection = db.collection('players');
            collection.updateMany({username: {$in:playerList}},{$inc:{[eloFieldName]:Math.round(eloChange)}})
                .then(
                    (res) => {}
                )
                .catch((err) => console.log(err))
        });
}

const getDraftUpdate = (team) => {
    let payload = {}
    payload = {}
    payload.team = teams[team]
    payload.availableChamps = champs[team]
    payload.status = status
    return payload
}

const getPlayerList = () => {
    let message = {}
    message.action = "playerList"
    message.payload = {}
    message.payload.players = Object.fromEntries(Object.entries(players).filter(([uuid, player]) => {
        return player.state.inLobby && player.state.online
    }))
    message.payload.status = status
    sendLatestMatch()
    return message
}

const getMatchHistory = (uuid) => {
    client.connect()
        .then(() => {
                const db = client.db(dbName);
                const collection = db.collection('matchhistory');
                collection.find().toArray().then(
                    (matches) => {
                        let allMatches = matches.sort((a, b) => {
                            let dateA = new Date(a.timestamp)
                            let dateB = new Date(b.timestamp)
                            return dateB - dateA
                        },1)
                        let message = {
                            action:"matchHistory",
                            payload:{
                                matches:allMatches
                            }
                        }
                        console.log("sending matchistory")
                        connections[uuid].send(JSON.stringify(message))
                    }
                )
            }
        )
}

function getLatestMatch ()  {
    client.connect()
        .then(() => {
            const db = client.db(dbName);
            const collection = db.collection('matchhistory');
            collection.find().toArray().then((result) => {
                lastMatch =  result.sort((a, b) => {
                    let dateA = new Date(a.timestamp)
                    let dateB = new Date(b.timestamp)
                    return dateB - dateA
                },1)[0]
                sendLatestMatch()
            });
        })
    // the following code examples can be pasted here...
}

const sendLatestMatch = () => {
    if(lastMatch){
        let message = {
            action:"updateLatestMatch"
        }
        message.payload = lastMatch
        broadcast(message)
    }
}

const checkStartCondition = () => {
    let not_ready_players = Object.keys(players).filter(
        (key) => !players[key].state.lockedIn && players[key].state.inLobby
    )
    if (not_ready_players.length === 0){
        startGame()
    }
}

const updateStatus = () => {
    let message = {
        action:"updateStatus",
        payload : {
            status: status
        }
    }
    broadcast(message)
}

const startGame = () => {
    status = "game"
    let message = getStartGameMessage()
    broadcast(message)
    setTimeout(() => {displayWinnerButtons()}, process.env.GAME_END_DELAY)
}

const getStartGameMessage = () => {
    let message = {}
    message.action = "finishDraft"
    message.payload = {}
    message.payload.status = "game"
    message.payload.teams = teams
    return message
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

const getDraft = () => {
    let playerCount = Object.keys(teams[0]).length
    const rolls = 3
    const total_picks = Math.max(playerCount * rolls,10);
    const champs_shuffled = allChamps.sort((c1,c2) => 0.5-Math.random())
    champs = [champs_shuffled.slice(0,total_picks), champs_shuffled.slice(total_picks,total_picks*2)]
}

const broadcastTeam = (message, team) => {
    Object.keys(teams[team]).forEach(uuid => {
        const connection = connections[uuid]
        if (connection) {
            connection.send(JSON.stringify(message))
        }
    })
}

const reset = () => {
    champs =[]
    teams = [{},{}]
    status = "lobby"
}

const endGame = () => {
    reset()
    Object.keys(players).forEach(uuid => {
        players[uuid].state = getDefaultPlayerState()
    })
    let message = getPlayerList()
    broadcast(message)
}

const handleClose = (uuid) => {
    //let timeout = setTimeout(() => handleDisconnect(uuid),3000)
    handleDisconnect(uuid)
}

const handleDisconnect = (uuid) => {
    // let team = players[uuid].state.team
    // if (team>-1){
    //     delete teams[team][uuid]
    // }
    delete connections[uuid]
    // delete players[uuid]
    players[uuid].state.online = false
    console.log("logged out ",players[uuid])
    // check if go we have to go back to lobby
    if (status !== "lobby"){
        console.log(teams)
        let stillSomeoneOnline = teams.filter((team) => {
             return Object.entries(team).filter(([playerUuid, player]) => {
                 console.log(player.state)
                return player.state.online
            }).length > 0
        }).length > 0
        if (!stillSomeoneOnline){
            console.log("noone online")
            reset()
        }
    }
    let message = getPlayerList()
    broadcast(message)
}

async function writeDB (jsonEntry) {

    // Use connect method to connect to the server
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('matchhistory');
    return await collection.insertOne(jsonEntry);
    // the following code examples can be pasted here...

}

const broadcast = (message) => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        if (connection) {
            connection.send(JSON.stringify(message))
        }
    })
}

const getDefaultPlayerState = () => {
    return {
        selectedChampion:"",
        lockedIn:false,
        team:-1,
        inLobby:false,
        online:false
    }
}

const resetPlayerObject = (playerObject) => {
    playerObject.selectedChampion = ""
    playerObject.lockedIn = false
    playerObject.inLobby = false
    playerObject.team = -1
}

async function getRanking () {
    await client.connect();
    const db = client.db(dbName);
    const playerCollection = db.collection('players');
    const matchCollection = db.collection('matchhistory');
    let playerInfo = await playerCollection.find({matchHistory:{$not:{$size:0}}}).map(
        async (player) => {
            return {
                username: player.username,
                matchHistory: await matchCollection.find({_id: {$in: player.matchHistory}}).toArray(),
                elo:Math.round(player.elo),
                elo1v1:Math.round(player.elo1v1)
            }
        }
    ).toArray()
    let playerStats = []
    for (let playerIdx in playerInfo){
        let player = playerInfo[playerIdx]
        let currentPlayerObject = {
            username:player.username,
            matchCount : player.matchHistory.length,
            elo: player.elo,
            elo1v1: player.elo1v1
        }
        currentPlayerObject.winRate = player.matchHistory.filter((match,matchIdx) => {
            console.log(match)
            return match.teams[match.winner].map((playerObj) => playerObj.username).includes(player.username)
        }).length / player.matchHistory.length
        playerStats.push(currentPlayerObject)
    }
    return playerStats
}

async function getPlayerMatchHistory (userName) {

    await client.connect();
    const db = client.db(dbName);
    const playerCollection = db.collection('players');
    const matchCollection = db.collection('matchhistory');
    const playerAnswer = await playerCollection.find({username: userName}).toArray();
    if (playerAnswer.length > 0){
        let player = playerAnswer[0]
        let matchHistory = player.matchHistory
        return await matchCollection.find({_id:{$in:matchHistory}}).toArray()
    }
    return []
}

async function appendMatch (matchId, match) {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('players');
    let players = []
    for (let team in match.teams){
        for (let player in match.teams[team]){
            players.push(match.teams[team][player].username)
        }
    }
    return await collection.updateMany({username:{$in:players}}, {$push:{matchHistory:matchId}})
}

const createPlayerDBEntry = (userName) => {
    return {
        username:userName,
        elo:1200,
        elo1v1:1200,
        matchHistory:[],
    }
}



getLatestMatch()

wsServer.on("connection", (connection, request) => {
    const { username } = url.parse(request.url, true).query
    const uuid = uuidv4()
    players[uuid] = {
        username,
        state : getDefaultPlayerState()
    }
    connections[uuid] = connection
    let oldPlayerEntry = Object.entries(players).find(([id, player]) => player.username===username)
    console.log(oldPlayerEntry, username)
    if(oldPlayerEntry!==undefined) {
        const [oldUuid, playerObject] = oldPlayerEntry
        if (!playerObject.state.online) {
            delete players[oldUuid]
            players[uuid] = playerObject
            playerObject.state.online = true
            for (let teamId in teams) {
                let team = teams[teamId]
                if (Object.keys(team).includes(oldUuid)) {
                    delete team[oldUuid]
                    team[uuid] = playerObject
                }
            }
            console.log("logged in a gain",playerObject)
            let message
            switch (status) {
                case "game":
                    message = getStartGameMessage()
                    connection.send(JSON.stringify(message))
                    break;
                case "draft":
                    message = {}
                    message.action = "startGame"
                    message.payload = getDraftUpdate(playerObject.state.team)
                    connection.send(JSON.stringify(message))
            }
        }
        else{
            connection.send(JSON.stringify({action:"logout"}))
        }
    }
    if(username) {
        client.connect()
            .then(() => {
                const db = client.db(dbName);
                const collection = db.collection('players');
                collection.find({username: username}).toArray()
                    .then(
                        (array) => {
                            if (array.length === 0) {
                                players[uuid].elo = 1200
                                collection.insertOne(createPlayerDBEntry(username))
                                    .then(res => {
                                    })
                                    .catch(err => console.log(err))
                            }
                            else{
                                players[uuid].elo = array[0].elo
                            }
                        }
                    )
            });
    }
    connection.on("message", message => handleMessage(message, uuid))
    connection.on("close", () => handleClose(uuid))
})
server.listen(port, () => {
    console.log(`WebSocket server is running on pfgort ${port}`)
})