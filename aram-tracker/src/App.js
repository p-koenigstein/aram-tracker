import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import Lobby from "./lobby/Lobby";
import ChampionSelect from "./champselect/ChampionSelect";
import {Login} from "./landingpage/Login";
import {Overview} from "./landingpage/Overview";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LeaderBoard} from "./leaderboard/LeaderBoard";
import {useCookies} from "react-cookie";

function App() {

  const [userName, setUserName] = useState("");
  const [cookies, setCookies, getCookies] = useCookies(["customaram"]);


  const updateUserName = (userName) => {
      setUserName(userName);
      setCookies("username", userName);
  }

    useEffect(() => {
        setUserName(cookies["username"])
    }, [cookies["username"]]);


  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />}/>
        <Route path="lobby" element={userName ? <Lobby username={userName}/>:<Login onSubmit={updateUserName}/>}/>
        <Route path="leaderboard" element={<LeaderBoard userName={userName}/>}/>
      </Routes>
  </BrowserRouter>

}
export default App;
