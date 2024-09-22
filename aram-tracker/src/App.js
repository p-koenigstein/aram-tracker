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
import './lobby/ChampSelecct.css'
import 'bootstrap/dist/css/bootstrap.css'

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
              <Route path="/" element={userName===""? <Login onSubmit={updateUserName}/> : <WelcomePage username={userName}/>}/>
              <Route path="lobby" element={userName===""? <Login onSubmit={updateUserName}/> : <Lobby username={userName}/>}/>
              <Route path="leaderboard" element={userName===""? <Login onSubmit={updateUserName}/> : <LeaderBoard userName={userName}/>}/>
              <Route path="matchhistory" element={userName===""? <Login onSubmit={updateUserName}/> : <MatchHistory/>}/>
          </Route>
      </Routes>
  </BrowserRouter>

}
export default App;
