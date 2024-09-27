import {Button} from "react-bootstrap";
import {useState} from "react";


export function NoLobby({createLobby, joinLobby}) {
    const [lobbyId, setLobbyId] = useState("");
    return (
        <div>
            <form
                onSubmit={(e) => {
                e.preventDefault()
                joinLobby(username)
            }}
                >
                <div className={"horiz"}>
                    <Button onClick={createLobby}>Create Lobby</Button>
                    <input
                        type="text"
                        value={lobbyId}
                        placeholder="Lobby ID"
                        onChange={(e) => setLobbyId(e.target.value)}
                    />
                    <input type="submit" value={"Join Lobby"} disabled={lobbyId===""}/>
                </div>
        </form>
</div>
)
}