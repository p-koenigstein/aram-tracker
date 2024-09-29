import { MongoClient } from 'mongodb'

const dbUrl = process.env.MONGODB_URI;
const client = new MongoClient(dbUrl);
const dbName = 'aramTracker';


export const createPlayerDBEntry = (userName) => {
    return {
        username:userName,
        elo:1200,
        elo1v1:1200,
        matchHistory:[],
    }
}

export const getElos = async (username) => {
    let elos = {
    }
    await client.connect()
    const db = client.db(dbName);
    const collection = db.collection('players');
    let users = await collection.find({username: username}).toArray()
    if (users.length===0){
        elos.elo = 1200
        elos.elo1v1 = 1200
        collection.insertOne(createPlayerDBEntry(username))
            .then(res => {
            })
            .catch(err => console.log(err))
        return elos
    }
    else{
        elos.elo = users[0].elo
        elos.elo1v1 = users[0].elo1v1
        return elos
    }
}

export const getLatestMatch = async () => {
    await client.connect()
    const db = client.db(dbName);
    const collection = db.collection("matchhistory");
    let matches = await collection.find().toArray()
    let lastMatch = matches.sort((a,b) => {
        let dateA = new Date(a.timestamp)
        let dateB = new Date(b.timestamp)
        return dateB - dateA
    },1)[0]
    return lastMatch
}

export const recordMatch = (lobby, winner) => {
    console.log(lobby)
    let dbEntry = {
        teams: lobby.teams.map((team) => team.map((player) => {
            console.log(player)
            return {
                username: player.username,
                champName: player.state.selectedChampion
            }
        })),
        winner,
        timestamp : new Date(Date.now()).toISOString()
    }
    console.log(dbEntry)
    client.connect().then(() => {
        const db = client.db(dbName);
        const collection = db.collection('matchhistory');
        collection.insertOne(dbEntry)
        .then((result) => {
            let matchId = result.insertedId
            appendMatch(matchId, lobby.players.map(player => player.username))
                .then(result => {})
                .catch(err => console.log(err))
        })
    })
    return dbEntry
}

const appendMatch = async (matchId, players) => {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('players');
    return await collection.updateMany({username:{$in:players}}, {$push:{matchHistory:matchId}})
}

export const saveEloUpdates = async (playerList, eloChange) => {
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

export const getMatchHistory = async () => {
    await client.connect()
    const db = client.db(dbName);
    const collection = db.collection('matchhistory');
    let matches = (await collection.find().toArray()).sort((a, b) => {
        let dateA = new Date(a.timestamp)
        let dateB = new Date(b.timestamp)
        return dateB - dateA
    })
    return matches
}

export const getPlayerProfile = async (userName) => {
    let playerProfile = {}
    let matches = await getPlayerMatchHistory(userName)
    let teammates = {players:{
        },
    champs:{
    }}
    let enemies = {players:{
        },
        champs:{
        }}
    matches.forEach((match) => {
        let ownTeam = match.teams.findIndex((team) => team.map((player) => player.username).includes(userName))
        let playerWon = match.winner === ownTeam
        for (let teamIdx in match.teams){
            let team = match.teams[teamIdx]
            team.forEach((player) => {
                let array = ownTeam===parseInt(teamIdx) ? teammates : enemies
                if (!Object.keys(array.players).includes(player.username)){
                    array.players[player.username] = {
                        won:0, lost:0
                    }
                }
                if (!Object.keys(array.champs).includes(player.champName)){
                    array.champs[player.champName] = {
                        won:0, lost:0
                    }
                }
                if (playerWon){
                    array.players[player.username].won = array.players[player.username].won + 1
                    array.champs[player.champName].won = array.champs[player.champName].won + 1
                }
                else {
                    array.players[player.username].lost = array.players[player.username].lost + 1
                    array.champs[player.champName].lost = array.champs[player.champName].lost + 1
                }
            })
        }
    })
    delete teammates.players[userName]
    delete teammates.champs.undefined
    delete enemies.players[userName]
    delete enemies.champs.undefined
    calculateWinRate(teammates.players)
    calculateWinRate(teammates.champs)
    calculateWinRate(enemies.players)
    calculateWinRate(enemies.champs)
    return {matches,
    enemies,
    teammates}
}

const calculateWinRate = (playerStatsObject) =>{
    Object.entries(playerStatsObject).forEach(([key,value], index) => {
        value.winRate = value.won / (value.won + value.lost)
    })
}

export const getPlayerMatchHistory = async (userName) => {
    await client.connect();
    const db = client.db(dbName);
    const playerCollection = db.collection('players');
    const matchCollection = db.collection('matchhistory');
    const playerAnswer = await playerCollection.find({username: userName}).toArray();
    if (playerAnswer.length > 0){
        let player = playerAnswer[0]
        let matchHistory = player.matchHistory
        return (await matchCollection.find({_id: {$in: matchHistory}}).toArray()).sort((a, b) => {
            let dateA = new Date(a.timestamp)
            let dateB = new Date(b.timestamp)
            return dateB - dateA
        });
    }
    return []
}

export const getRanking = async () => {
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
            return match.teams[match.winner].map((playerObj) => playerObj.username).includes(player.username)
        }).length / player.matchHistory.length
        playerStats.push(currentPlayerObject)
    }
    return playerStats
}
