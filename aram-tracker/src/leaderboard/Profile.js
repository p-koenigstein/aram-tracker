import {useSearchParams} from "react-router-dom";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {MatchList} from "../matchhistory/MatchHistory";
import {Button, Col, Row, Table} from "react-bootstrap";
import {PlayerDisplay} from "./PlayerDisplay";
import {ChampDisplay} from "./ChampDisplay";

export function Profile ({username}) {

    const [searchParams] = useSearchParams()
    const [matchHistory, setMatchHistory] = useState([]);
    const [useMostPlayers, setUseMostPlayers] = useState(true);
    const [useMostChamps, setUseMostChamps] = useState(true);
    const [teammates, setTeammates] = useState({});
    const [displayTeammates, setDisplayTeammates] = useState({})
    const [enemies, setEnemies] = useState({});
    const [displayEnemies, setDisplayEnemies] = useState({})
    let playername = searchParams.get('player')
    if(playername===null){
        playername = username
    }

    console.log(playername)

    const WS_URL = process.env.REACT_APP_WS_URL;
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        sendJsonMessage({action:"requestProfile", payload:{player:playername}})
    }, [playername]);

    useEffect(() => {
        updateDisplay()
    },[useMostChamps, useMostPlayers, enemies, teammates, matchHistory])

    const sortWinrate = ([nameA, statsA],[nameB, statsB]) => {
        return statsB.winRate-statsA.winRate
    }

    const sortName = ([nameA, statsA],[nameB, statsB]) => {
        return nameA.localeCompare(nameB)
    }

    useEffect(() => {
        if(lastJsonMessage !== null){
            switch(lastJsonMessage.action){
                case "profileAnswer":{
                    console.log("update ",playername)
                    setMatchHistory(lastJsonMessage.payload.matches)
                    setEnemies(lastJsonMessage.payload.enemies)
                    setTeammates(lastJsonMessage.payload.teammates)
                }
            }
        }
    }, [lastJsonMessage]);

    const sortGameAmount = ([nameA, statsA], [nameB, statsB]) => {
        return (statsB.lost + statsB.won)- (statsA.lost + statsA.won)
    }

    const updateDisplay = () => {
        let team = {}
        let enem = {}
        if (useMostChamps){
            if(Object.keys(enemies).includes("champs")){
                enem.champs = Object.fromEntries(Object.entries(enemies.champs).sort(sortGameAmount).slice(0,5))
            }
            if(Object.keys(teammates).includes("champs")) {
                team.champs = Object.fromEntries(Object.entries(teammates.champs).sort(sortGameAmount).slice(0, 5))
            }
        }
        else{
            if(Object.keys(enemies).includes("champs")){
                enem.champs = enemies.champs
            }
            if(Object.keys(teammates).includes("champs")) {
                team.champs = teammates.champs
            }
        }
        if (useMostPlayers){
            if(Object.keys(enemies).includes("players")) {
                enem.players = Object.fromEntries(Object.entries(enemies.players).sort(sortGameAmount).slice(0, 5))
            }
            if(Object.keys(teammates).includes("players")) {
                team.players = Object.fromEntries(Object.entries(teammates.players).sort(sortGameAmount).slice(0, 5))
            }
        }
        else{
            if(Object.keys(enemies).includes("players")) {
                enem.players = enemies.players
            }
            if(Object.keys(teammates).includes("players")) {
                team.players = teammates.players
            }
        }
        setDisplayTeammates(team)
        setDisplayEnemies(enem)
    }

    return (<div>
        <h3 className={"horiz"}>Profil von {playername===null ? username : playername}</h3>
        { matchHistory.length > 0 ?
            <div>
        <Table>
            <Row>
               <Col>
                   <div className={"horiz"}>
                       <h4>With Teammates</h4>
                   </div>
               </Col>
                <Col>
                    <div className={"horiz"}>
                        <h4>Against Enemies</h4>
                    </div>

                </Col>
            </Row>
            {Object.keys(displayTeammates).includes('players') &&
                <Row style={{"margin-bottom":10}}>
                    <Col>
                        <div className={"horiz teammate"}>
                            {Object.entries(displayTeammates.players).sort(sortWinrate).map(([playername, stats]) =>
                                <PlayerDisplay playername={playername} stats={stats} isTeammate={true}/>)}
                        </div>
                        <div className={"horiz"}>
                            {useMostPlayers &&
                                <Button variant={"secondary"} onClick={() => setUseMostPlayers(false)}>more</Button>
                            }
                        </div>
                    </Col>
                    <Col>
                        <div className={"horiz enemy"}>
                            {Object.entries(displayEnemies.players).sort(sortWinrate).map(([playername, stats]) =>
                                <PlayerDisplay
                                    playername={playername} stats={stats} isTeammate={false}/>)}
                        </div>
                        <div className={"horiz"}>
                            {useMostPlayers &&
                            <Button variant={"secondary"} onClick={() => setUseMostPlayers(false)}>more</Button>
                            }
                        </div>
                    </Col>
                </Row>
            }

            {Object.keys(displayTeammates).includes('champs') &&
                <Row>
                    <Col>
                    <div className={"horiz teammate "+(useMostChamps ? "":"smallIcons")}>
                        {Object.entries(displayTeammates.champs).sort(sortName).map(([champName, stats]) =>
                            <ChampDisplay
                                champName={champName} stats={stats} isTeammate={true}/>)}
                    </div>
                    <div className={"horiz"}>
                        {useMostChamps &&
                        <Button variant={"secondary"} onClick={() => setUseMostChamps(false)}>more</Button>
                    }
                    </div>
                </Col>
                <Col>
                    <div className={"horiz enemy "+(useMostChamps ? "":"smallIcons")}>
                        {Object.entries(displayEnemies.champs).sort(sortName).map(([champName, stats]) => <ChampDisplay
                            champName={champName} stats={stats} isTeammate={false}/>)}
                    </div>
                    <div className={"horiz"}>
                        {useMostChamps &&
                        <Button variant={"secondary"} onClick={() => setUseMostChamps(false)}>more</Button>
                    }
                    </div>
                </Col>
            </Row>
            }
        </Table>
                <div className={"horiz"}>
                    <div className={"horiz"}>
                        <h3>Match History </h3>
            </div>
            <MatchList matches={matchHistory}/>
        </div>
            </div> : <div className={"horiz defaultPadding"}>
                <h4>Player hasn't played a game yet</h4>
            </div>}
    </div>)
}