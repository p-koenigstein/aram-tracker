import { useState } from "react"

export function Login({ onSubmit }) {
    const [username, setUsername] = useState("")
    return (
        <>
            <h1>Welcome summoner!</h1>
            <p>What name do you go by?</p>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit(username)
                }}
            >
                <input
                    type="text"
                    value={username}
                    placeholder="Summoner name"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input type="submit" value={"Set name"}/>
            </form>
        </>
    )
}