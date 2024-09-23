import {useSearchParams} from "react-router-dom";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {MatchList} from "../matchhistory/MatchHistory";

export function Profile ({username}) {

    const [searchParams] = useSearchParams()
    const [matchHistory, setMatchHistory] = useState([]);
    const playername = searchParams.get('player')


    const WS_URL = process.env.REACT_APP_WS_URL;
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        sendJsonMessage({action:"requestProfile", payload:{player:playername}})
    }, []);

    useEffect(() => {
        if(lastJsonMessage !== null){
            console.log(lastJsonMessage)
            switch(lastJsonMessage.action){
                case "profileAnswer":{
                    setMatchHistory(lastJsonMessage.payload)
                }
            }
        }
    }, [lastJsonMessage]);


    return (<div>
        <h3 className={"horiz"}>Profil von {playername===null ? username : playername}</h3>
        {matchHistory.length>0 ? <MatchList matches={matchHistory}/> : <div>Spieler nicht gefunden oder keine abgeschlossenen spiele</div>}
    </div>)
}