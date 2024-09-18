import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import Lobby from "./lobby/Lobby";
import ChampionSelect from "./champselect/ChampionSelect";
import {Login} from "./lobby/Login";

function App() {

  const [userName, setUserName] = useState("")

  return userName ? (
          <Lobby username={userName}/>)
      :
      (<Login onSubmit={setUserName}/>)
}
export default App;
