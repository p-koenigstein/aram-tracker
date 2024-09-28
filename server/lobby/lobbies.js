import {recordMatch, saveEloUpdates} from "../database/database.js";
import {v4 as uuid} from 'uuid'

let lobbies = {

}


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

export const createLobby = (creatorUserName) => {
    let lobbyId = uuid().split("-")[0]
    let lobby = {
        players : [],
        availableChamps : allChamps,
        champs : [[],[]],
        teams : [[],[]],
        fearless : false,
        ranked : true,
        creator : creatorUserName,
        status : "lobby"
    }
    lobbies[lobbyId] = lobby
    return lobbyId
}

export const joinLobby = (playerObject, lobbyId) => {
    if (Object.keys(lobbies).includes(lobbyId)) {
        let lobby = lobbies[lobbyId]
        if (lobby.status==="lobby") {
            lobby.players.push(playerObject)
            playerObject.lobby = lobbyId
            return lobby
        }
        return false
    }
    return false
}

export const leaveLobby = (playerObject) => {
    let lobbyId = playerObject.lobby
    playerObject.lobby = ""
    if (lobbyId !=="" && Object.keys(lobbyId).includes(lobbyId)) {
        let lobby = lobbies[lobbyId]
        if(lobby.players.includes(playerObject)) {
            lobby.players.remove(playerObject)
        }
        lobby.teams.forEach((team) => {
            if(team.includes(playerObject)){
                team.remove(playerObject)
            }
        })
        return checkLobbyAlive()
    }
    return undefined
}

export const checkLobbyAlive = (lobbyId) => {
    if (lobbies[lobbyId].players.filter((player) => player.inLobby === lobbyId && player.online).length > 0){
        return lobbies[lobbyId]
    }
    delete lobbies[lobbyId]
    return null
}

export const shuffleTeams = (lobbyId) => {
    let lobby = lobbies[lobbyId]
    let players = lobby.players
    if (players.filter((player) => player.state.online).length>1) {
        lobby.status = "teamSelect"
        let teams = [[],[]]
        const randomOrder = players.sort((a, b) => 0.5 - Math.random())
        let current_team = 0
        for (let playerUUID in randomOrder) {
            let currentUUID = randomOrder[playerUUID]
            teams[current_team][currentUUID] = players[currentUUID]
            players[currentUUID].state.team = current_team
            current_team = (current_team + 1) % 2
        }
        lobby.teams = teams
        return lobby
    }
    return false
}

export const startChampSelect = (lobbyId) => {
    let lobby = lobbies[lobbyId]
    if (lobby.players.filter((player) => player.state.online).length>1) {
        lobby.champs = getDraft(lobby.champs,lobby.teams.map((team) => team.length))
        lobby.status = "draft"
        return lobby
    }
    return false
}

export const getDraft = (champs, teamSizes) => {
    let playerCount = Math.max(teamSizes)
    const rolls = 3
    const total_picks = Math.max(playerCount * rolls,10);
    const champs_shuffled = champs.sort((c1,c2) => 0.5-Math.random())
    return [champs_shuffled.slice(0,total_picks), champs_shuffled.slice(total_picks,total_picks*2)]
}

export const startGame = (lobbyId) => {
    let lobby = lobbies[lobbyId]
    lobby.status = "inGame"
}

export const endGame = (lobbyId, winner) => {
    let lobby = lobbies[lobbyId]
    let lastMatch = recordMatch(lobby, winner)
    updateElo(lobby, winner)
    lobby.teams = [[],[]]
    if (!lobby.fearless){
        lobby.availableChamps = allChamps
    }
    lobby.status = "lobby"
    return lastMatch
}

const updateElo = (lobby, winner) => {

    let elos = lobby.teams.map((team) => {
        return team.map((player) => player.elo).reduce((a,b) => a+b)/team.length
    })
    let probabilities = elos.map((elo, idx) => {
        return (1 / (1 + Math.pow(10, ((elo - elos[(idx + 1) % 2]) / 400))))
    })
    const K = 30

    let eloChange = [K * ((1-winner)-probabilities[1]), K * ((1-(1-winner)-probabilities[0]))]

    lobby.teams.forEach((team,index) => {
        let teamPlayers = team.map((player) => {
            player.elo = player.elo + eloChange[index]
            return player.username
        })
        saveEloUpdates(teamPlayers, eloChange[index])
            .then(() => {})
            .catch(() => {})
    })
}

export const selectChampion = (playerName, lobbyId, champName) => {
    let lobby = lobbies[lobbyId]
    let team = lobby.teams.find((team, idx) => team.map((player) => player.username).includes(playerName)).map((team,idx) => idx)
    if (!lobby.champs[team].includes(champName)){
        return false
    }
    let player = lobby.players.find((player) => player.username === playerName)[0]
    if (player.state.lockedIn){
        return false
    }
    player.state.selectedChampion = champName
    return lobby
}

export const lockInChampion = (playerName, lobbyId) => {
    let lobby = lobbies[lobbyId]
    let player = lobby.players.find((player) => player.username === playerName)[0]
    if (player.state.selectedChampion==="")
    {
        return false
    }
    player.state.lockedIn = true
    return lobby
}

export const checkStartCondition = (lobbyId) => {
    let lobby = lobbies[lobbyId]
    return lobby.players.filter((player) => !player.state.lockedIn && player.state.online).length > 1
}