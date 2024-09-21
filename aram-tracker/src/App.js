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
import {UserInfo} from "./landingpage/UserInfo";

function App() {

  const [userName, setUserName] = useState("");
  const [cookies, setCookies, deleteCookie] = useCookies(["customaram"]);


  const updateUserName = (userName) => {
      setUserName(userName);
      setCookies("username", userName);
  }

  const logout = () => {
      deleteCookie("username")
      setUserName("")
      console.log("logout")
  }

    useEffect(() => {
        if (process.env.REACT_APP_IS_DEV==="false"){
            setUserName(cookies["username"])
        }
    }, [cookies["username"]]);


  return <BrowserRouter>
      <Routes>
          <Route path="/" element={<UserInfo username={userName} logout={logout}/>}>
            <Route path="/" element={<Overview />}/>
            <Route path="lobby" element={userName ? <Lobby username={userName}/>:<Login onSubmit={updateUserName}/>}/>
            <Route path="leaderboard" element={<LeaderBoard userName={userName}/>}/>
              #</Route>
      </Routes>
  </BrowserRouter>

}
export default App;
