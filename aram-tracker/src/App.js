import logo from './logo.svg';
import './App.css';
import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import Lobby from "./lobby/Lobby";
import ChampionSelect from "./champselect/ChampionSelect";
import {Login} from "./landingpage/Login";
import {Overview} from "./landingpage/Overview";
import {BrowserRouter, Outlet, Route, Routes, useNavigate} from "react-router-dom";
import {LeaderBoard} from "./leaderboard/LeaderBoard";
import {useCookies} from "react-cookie";
import {UserInfo} from "./landingpage/UserInfo";
import {MatchHistory} from "./matchhistory/MatchHistory";
import {WelcomePage} from "./landingpage/WelcomePage";
import {Children} from "react";
import './lobby/ChampSelecct.css'
import 'bootstrap/dist/css/bootstrap.css'
import useWebSocket from "react-use-websocket";
import {Profile} from "./leaderboard/Profile";
import ReactDOM from "react-dom/client";
import {LobbyPreview} from "./lobby/LobbyPreview";


function App() {


    const [username, setUsername] = useState("");
    const [cookies, setCookies, deleteCookie] = useCookies(["customaram"]);
    const [useDarkMode, setDarkMode] = useState(false);

    const WS_URL = process.env.REACT_APP_WS_URL;
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        if (lastJsonMessage!== null){
            switch(lastJsonMessage.action){
                case "logout":
                    setUsername("")
                    break;
            }
        }
    },[lastJsonMessage])
    
    const toggleDarkMode = () => {
        setCookies("darkMode", !useDarkMode)
        setDarkMode(!useDarkMode)
    }

    const updateUserName = (userName) => {
        setUsername(userName);
        setCookies("username", userName);
    }

    const logout = () => {
        deleteCookie("username")
        setUsername("")
    }

    useEffect(() => {
        document.body.setAttribute("data-bs-theme",useDarkMode ? "dark" : "light")
    }, [useDarkMode]);

    useEffect(() => {
        if (process.env.REACT_APP_IS_DEV === "false") {
            if (cookies["username"]) {
                setUsername(cookies["username"])
            }
        }
    }, [cookies["username"]]);

    useEffect(() => {
        if (cookies["darkMode"] !== undefined) {
            setDarkMode(cookies["darkMode"])
        }
    }, [])

    return (
        <div data-bs-theme={useDarkMode ? "dark" : "light"}>
            <BrowserRouter>
                <Routes>
                    <Route path="/"
                           element={<UserInfo username={username} logout={logout} toggleDarkMode={toggleDarkMode}
                                              useDarkMode={useDarkMode}/>}>
                        <Route path="/" element={username === "" ? <Login onSubmit={updateUserName}/> :
                            <WelcomePage username={username}/>}/>
                        <Route path="lobby" element={username === "" ? <Login onSubmit={updateUserName}/> :
                            <Lobby username={username}/>}/>
                        <Route path="leaderboard" element={username === "" ? <Login onSubmit={updateUserName}/> :
                            <LeaderBoard username={username}/>}/>
                        <Route path="matchhistory"
                               element={username === "" ? <Login onSubmit={updateUserName}/> : <MatchHistory/>}/>
                        <Route path="profile" element={username === "" ? <Login onSubmit={updateUserName}/> :
                            <Profile username={username}/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )

}

//<a href="https://www.flaticon.com/free-icons/sort-ascending" title="sort ascending icons">Sort ascending icons created by Rahul Kaklotar - Flaticon</a>
export default App;
