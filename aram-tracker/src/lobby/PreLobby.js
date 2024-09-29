import {Button} from "react-bootstrap";
import {useState} from "react";


export function PreLobby({createLobby, joinLobby}) {
    const [lobbyId, setLobbyId] = useState("");
    return (
        <div>
            <form
                onSubmit={(e) => {
                e.preventDefault()
                joinLobby(lobbyId)
            }}
                >
                <div className={"horiz"}>
                    <Button onClick={createLobby}>Create LobbyPage</Button>
                    <input
                        type="text"
                        value={lobbyId}
                        placeholder="LobbyPage ID"
                        onChange={(e) => setLobbyId(e.target.value)}
                    />
                    <Button type="submit" disabled={lobbyId===""}>Join LobbyPage</Button>
                </div>
        </form>
</div>
)
}