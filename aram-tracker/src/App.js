import logo from './logo.svg';
import './App.css';
import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import Lobby from "./lobby/Lobby";
import ChampionSelect from "./champselect/ChampionSelect";
import {Login} from "./landingpage/Login";
import {Overview} from "./landingpage/Overview";
import {BrowserRouter, Outlet, Route, Routes} from "react-router-dom";
import {LeaderBoard} from "./leaderboard/LeaderBoard";
import {useCookies} from "react-cookie";
import {UserInfo} from "./landingpage/UserInfo";
import {MatchHistory} from "./matchhistory/MatchHistory";

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
              {userName==="" &&
                  <Route path="/*" element={<Login onSubmit={updateUserName}/>}/>
                      }
              {userName!=="" &&
                  <Fragment>
            <Route path="lobby" element={<Lobby username={userName}/>}/>
            <Route path="leaderboard" element={<LeaderBoard userName={userName}/>}/>
              <Route path="matchhistory" element={<MatchHistory/>}/>
                  </Fragment>
             }
          </Route>
      </Routes>
  </BrowserRouter>

}
export default App;
