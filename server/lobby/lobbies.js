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

export const createLobby = (creatorUserName, playerObject) => {
    let lobbyId = uuid().split("-")[0]
    let lobby = {
        lobbyId,
        players : [],
        availableChamps : allChamps,
        champs : [[],[]],
        teams : [[],[]],
        fearless : false,
        fearlessChampsPlayed: [],
        ranked : true,
        creator : creatorUserName,
        status : "lobby"
    }
    lobby.players.push(playerObject)
    lobbies[lobbyId] = lobby
    return lobby
}

export const joinLobby = (playerObject, lobbyId) => {
    if (Object.keys(lobbies).includes(lobbyId)) {
        let lobby = lobbies[lobbyId]
        if (lobby.status==="lobby") {
            lobby.players.push(playerObject)
            return lobby
        }
        return false
    }
    return false
}

export const leaveLobby = (playerObject) => {
    let lobbyId = playerObject.state.inLobby
    playerObject.state.inLobby = ""
    console.log("lobbyId", lobbyId)
    if (lobbyId !=="" && Object.keys(lobbies).includes(lobbyId)) {
        let lobby = lobbies[lobbyId]
        lobby.players = lobby.players.filter((player) => player.username!==playerObject.username)
        console.log("checking lobbyAlive")
        return checkLobbyAlive(lobbyId)
    }
    return undefined
}

export const toggleFearless = (lobbyId, username) => {
    let lobby = lobbies[lobbyId]
    if (username === lobby.creator){
        lobby.fearless = ! lobby.fearless
        return lobby
    }
    return false;
}

export const checkLobbyAlive = (lobbyId) => {
    if (!Object.keys(lobbies).includes(lobbyId)){
        return false
    }
    console.log(lobbies[lobbyId].players.map((player) => player.state.online))
    if (lobbies[lobbyId].players.filter((player) => player.state.inLobby === lobbyId && player.state.online).length > 0){
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
        for (let idx in randomOrder) {
            let player = randomOrder[idx]
            teams[current_team].push(player)
            player.state.team = current_team
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
        lobby.champs = getDraft(lobby.availableChamps,lobby.teams.map((team) => team.length))
        lobby.status = "draft"
        return lobby
    }
    return false
}

export const getDraft = (champs, teamSizes) => {
    let playerCount = teamSizes[0]
    const rolls = 3
    const total_picks = Math.max(playerCount * rolls,10);
    const champs_shuffled = champs.sort((c1,c2) => 0.5-Math.random())
    let answer = [champs_shuffled.slice(0,total_picks), champs_shuffled.slice(total_picks,total_picks*2)]
    return answer
}

export const startGame = (lobbyId) => {
    let lobby = lobbies[lobbyId]
    lobby.status = "inGame"
}

export const endGame = (lobbyId, winner) => {
    let lobby = lobbies[lobbyId]
    let lastMatch = recordMatch(lobby, winner)
    lobby.teams.reduce((a1,a2) => [...a1,...a2]).map((player) => player.state.selectedChampion).forEach((champ) => lobby.fearlessChampsPlayed.push(champ))
    console.log(lobby.fearlessChampsPlayed)
    lobby.availableChamps = allChamps
    if (lobby.fearless){
        lobby.availableChamps = lobby.availableChamps.filter((champ) => !(lobby.fearlessChampsPlayed.includes(champ)))
    }
    updateElo(lobby, winner)
    lobby.teams = [[],[]]
    lobby.champs = [[],[]]
    lobby.players.forEach((player) => {
        resetPlayer(player)
    })
    lobby.status = "lobby"
    return lastMatch
}

export const resetPlayer = (playerObject) => {
    playerObject.state.lockedIn = false
    playerObject.state.selectedChampion = ""
}

export const getLobby = (lobbyId) => {
    return lobbies[lobbyId]
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
    let player = lobby.players.find((player) => player.username === playerName)
    let team = player.state.team
    if (!lobby.champs[team].includes(champName)){
        console.log("cant pick that champ")
        return false
    }
    console.log(player)
    if (player.state.lockedIn){
        console.log("already locked in")
        return false
    }
    player.state.selectedChampion = champName
    console.log("selected champ")
    return lobby
}

export const getTeamNames = (lobbyId) => {
    return lobbies[lobbyId].teams.map(team => {
        let teamLeader = Object.keys(team).sort((p1,p2) => 0.5 - Math.random())[0]
        return "Team "+team[teamLeader].username
    })
}

export const lockInChampion = (playerName, lobbyId) => {
    let lobby = lobbies[lobbyId]
    let player = lobby.players.find((player) => player.username === playerName)
    if (player.state.selectedChampion==="")
    {
        return false
    }
    player.state.lockedIn = true
    return lobby
}

export const checkStartCondition = (lobbyId) => {
    let lobby = lobbies[lobbyId]
    return !(lobby.players.filter((player) => !player.state.lockedIn && player.state.online).length > 0)
}