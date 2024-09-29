import {Button} from "react-bootstrap";
import {useState} from "react";


export function PreLobby({createLobby, joinLobby}) {
    const [lobbyId, setLobbyId] = useState("");
    return (
        <div>
            <div className={"horiz"}>
                <div className={"horiz defaultPadding"}>
                <h3>Lobbies</h3>
                </div>
                <div className={"horiz defaultPadding"}>
                    <Button onClick={createLobby} variant={"success"}>Create Lobby</Button>
                </div>
                <div className={"defaultPadding"}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        joinLobby(lobbyId)
                    }}
                >
                    <input
                        type="text"
                        value={lobbyId}
                        placeholder="Lobby ID"
                        onChange={(e) => setLobbyId(e.target.value)}
                    /> &nbsp;
                    <Button type="submit" disabled={lobbyId === ""} variant={"outline-success"}>Join Lobby</Button>
                </form>
                </div>
            </div>
</div>
)
}