
const {MongoClient} = require('mongodb')

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

export const recordMatch = (lobby, winner) => {
    let dbEntry = {
        teams: lobby.teams.map((team) => team.map((player) => {
            return {
                username: player.username,
                playerName: player.state.selectedChampion
            }
        })),
        winner,
        timestamp : new Date(Date.now()).toISOString()
    }
    client.connect().then(() => {
        const db = client.db(dbName);
        const collection = db.collection('matchhistory');
        collection.insertOne(dbEntry)
        .then((result) => {
            let matchId = result.insertedId
            console.log(matchId)
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
        return dateA - dateB
    })
    return matches
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
        return await matchCollection.find({_id:{$in:matchHistory}}).toArray()
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
            console.log(match)
            return match.teams[match.winner].map((playerObj) => playerObj.username).includes(player.username)
        }).length / player.matchHistory.length
        playerStats.push(currentPlayerObject)
    }
    return playerStats
}
