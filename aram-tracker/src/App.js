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
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {Profile} from "./leaderboard/Profile";


function App() {

    const [userName, setUserName] = useState("");
    const [cookies, setCookies, deleteCookie] = useCookies(["customaram"]);
    const [useDarkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setCookies("darkMode", !useDarkMode)
        setDarkMode(!useDarkMode)
    }

    const updateUserName = (userName) => {
        setUserName(userName);
        setCookies("username", userName);
    }

    const logout = () => {
        deleteCookie("username")
        setUserName("")
    }

    useEffect(() => {
        if (process.env.REACT_APP_IS_DEV === "false") {
            if (cookies["username"]) {
                setUserName(cookies["username"])
            }
        }
    }, [cookies["username"]]);

    useEffect(() => {
        if (cookies["darkMode"] !== undefined) {
            console.log(cookies["darkMode"])
            setDarkMode(cookies["darkMode"])
        }
    }, [])

    const darkTheme = createTheme({
        palette: {
            mode: useDarkMode ? "dark" : "light",
            primary: {
                main: '#90caf9'
            },
            secondary: {
                main: '#131052'
            }
        }
    })

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route path="/"
                           element={<UserInfo username={userName} logout={logout} toggleDarkMode={toggleDarkMode}
                                              useDarkMode={useDarkMode}/>}>
                        <Route path="/" element={userName === "" ? <Login onSubmit={updateUserName}/> :
                            <WelcomePage username={userName}/>}/>
                        <Route path="lobby" element={userName === "" ? <Login onSubmit={updateUserName}/> :
                            <Lobby username={userName}/>}/>
                        <Route path="leaderboard" element={userName === "" ? <Login onSubmit={updateUserName}/> :
                            <LeaderBoard username={userName}/>}/>
                        <Route path="matchhistory"
                               element={userName === "" ? <Login onSubmit={updateUserName}/> : <MatchHistory/>}/>
                        <Route path="profile" element={userName === "" ? <Login onSubmit={updateUserName}/> :
                            <Profile username={userName}/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>)

}

//<a href="https://www.flaticon.com/free-icons/sort-ascending" title="sort ascending icons">Sort ascending icons created by Rahul Kaklotar - Flaticon</a>
export default App;
