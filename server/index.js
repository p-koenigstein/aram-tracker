

const http = require('http')
const {WebSocketServer} = require('ws')
const url = require('url')
const uuidv4 = require("uuid").v4
const server = http.createServer()

const wsServer = new WebSocketServer({server})
const port = 8000

let players = {}
let connections = {}

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

const handleMessage = (bytes, uuid) => {
    const request = JSON.parse(bytes.toString())
    let message = {}
    switch (request["action"]) {
        case "register":
            message.action = "playerList"
            message.payload = players
            broadcast(message)
            break;
        case "startGame":
            message.action = "startGame"
            //shuffle keys
            const randomOrder = Object.keys(players).sort((a,b) => 0.5 - Math.random())
            let current_team = 0
            for (let playerUUID in randomOrder){
                let currentUUID = randomOrder[playerUUID]
                teams[current_team][currentUUID] = players[currentUUID]
                players[currentUUID].state.team = current_team
                current_team = (current_team +1) % 2
            }
            getDraft()
            for (let team=0;team<2;team++){
                message.payload= {}
                message.payload.team = teams[team]
                message.payload.availableChamps = champs[team]
                broadcastTeam(message,team)
            }
            /// custom br
            break;
        case "selectChampion":
            let request_pl = request.payload
            let champName = request_pl.champName
            let team = players[uuid].state.team
            teams[team][uuid].state.selectedChampion = champName
            message.action = "updateChamps"
            message.payload = {}
            message.payload.team = teams[team]
            broadcastTeam(message,team)
            break;
        default:
            break;
    }
}

const getDraft = () => {
    let playerCount = Object.keys(teams[0]).length
    const rolls = 3
    const total_picks = playerCount * rolls;
    const champs_shuffled = allChamps.sort((c1,c2) => 0.5-Math.random())
    champs = [champs_shuffled.slice(0,total_picks), champs_shuffled.slice(total_picks,total_picks*2)]
}

const broadcastTeam = (message, team) => {
    Object.keys(teams[team]).forEach(uuid => {
        const connection = connections[uuid]
        connection.send(JSON.stringify(message))
    })
}

const handleClose = (uuid) => {
    delete connections[uuid]
    delete players[uuid]
    broadcast()
}

const broadcast = (message) => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        connection.send(JSON.stringify(message))
    })
}

wsServer.on("connection", (connection, request) => {
    const { username } = url.parse(request.url, true).query
    const uuid = uuidv4()
    players[uuid] = {
        username,
        state : {
            selectedChampion:""
        }
    }
    connections[uuid] = connection
    connection.on("message", message => handleMessage(message, uuid))
    connection.on("close", () => handleClose(uuid))
})
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`)
})