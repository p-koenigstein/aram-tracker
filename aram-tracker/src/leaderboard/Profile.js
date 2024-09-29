import {useSearchParams} from "react-router-dom";
import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {MatchList} from "../matchhistory/MatchHistory";
import {Col, Row, Table} from "react-bootstrap";
import {PlayerDisplay} from "./PlayerDisplay";
import {ChampDisplay} from "./ChampDisplay";

export function Profile ({username}) {

    const [searchParams] = useSearchParams()
    const [matchHistory, setMatchHistory] = useState([]);
    const [enemies, setEnemies] = useState({});
    const [teammates, setTeammates] = useState({});
    const playername = searchParams.get('player')


    const WS_URL = process.env.REACT_APP_WS_URL;
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        sendJsonMessage({action:"requestProfile", payload:{player:playername}})
    }, [playername]);

    const sortWinrate = ([nameA, statsA],[nameB, statsB]) => {
        return statsB.winRate-statsA.winRate
    }

    useEffect(() => {
        if(lastJsonMessage !== null){
            switch(lastJsonMessage.action){
                case "profileAnswer":{
                    setMatchHistory(lastJsonMessage.payload.matches)
                    setEnemies(lastJsonMessage.payload.enemies)
                    setTeammates(lastJsonMessage.payload.teammates)
                }
            }
        }
    }, [lastJsonMessage]);

    console.log(teammates)
    console.log(enemies)

    return (<div>
        <h3 className={"horiz"}>Profil von {playername===null ? username : playername}</h3>
        { matchHistory.length > 0 ?
            <div>
        <Table>
            <Row>
               <Col>
                   <div className={"horiz"}>
                       <h4>Teammates</h4>
                   </div>
               </Col>
                <Col>
                    <div className={"horiz"}>
                        <h4>Enemies</h4>
                    </div>

                </Col>
            </Row>
            {Object.keys(teammates).includes('players') &&
                <Row style={{"margin-bottom":10}}>
                <Col>
                    <div className={"horiz teammate"}>
                    {Object.entries(teammates.players).sort(sortWinrate).map(([playername,stats]) => <PlayerDisplay playername={playername} stats={stats} isTeammate={true}/>)}
                    </div>
                </Col>
                <Col>
                    <div className={"horiz enemy"}>
                        {Object.entries(enemies.players).sort(sortWinrate).map(([playername, stats]) => <PlayerDisplay
                            playername={playername} stats={stats} isTeammate={false}/>)}
                    </div>
                </Col>
            </Row>
            }

            {Object.keys(teammates).includes('champs') &&
            <Row>
                <Col>
                    <div className={"horiz teammate"}>
                        {Object.entries(teammates.champs).sort(sortWinrate).map(([champName, stats]) => <ChampDisplay
                            champName={champName} stats={stats} isTeammate={true}/>)}
                    </div>
                </Col>
                <Col>
                    <div className={"horiz enemy"}>
                        {Object.entries(enemies.champs).sort(sortWinrate).map(([champName, stats]) => <ChampDisplay
                            champName={champName} stats={stats} isTeammate={false}/>)}
                    </div>
                </Col>
            </Row>
            }
        </Table>
        <div className={"horiz"}>
            <h3>Match History </h3>
            <MatchList matches={matchHistory}/>
        </div>
            </div> : <div className={"horiz defaultPadding"}>
                <h4>Player hasn't played a game yet</h4>
            </div>}
    </div>)
}