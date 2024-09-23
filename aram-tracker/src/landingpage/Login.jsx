import { useState } from "react"

export function Login({ onSubmit }) {
    const [username, setUsername] = useState("")
    return (
        <div className={"horiz login"}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSubmit(username)
                }}
            >
                <div className={"horiz"}>
                    <h1>Login</h1>
                </div>
                <div className={"horiz"}>
                    <p>Welcome, please enter your summoner name to continue</p>
                </div>
                <div className={"horiz"}>
                    <input
                        type="text"
                        value={username}
                        placeholder="Summoner name"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className={"horiz margin-top"}>
                    <input type="submit" value={"Log in"}/>
                </div>
            </form>
        </div>
    )
}