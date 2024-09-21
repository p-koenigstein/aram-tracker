import useWebSocket from "react-use-websocket";
import {Col, ListGroup, Row, Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import {PlayerSlot} from "../champselect/ChampionSelect";


export function MatchHistory ({})  {

    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);

    const {sendJsonMessage, lastJsonMessage} = useWebSocket(process.env.REACT_APP_WS_URL,
        {
            share:true
        })

    useEffect(() => {
        sendJsonMessage({action:"requestMatchHistory"})
    }, []);

    useEffect(() => {

        if (lastJsonMessage !== null){
            if (lastJsonMessage.action === "matchHistory"){
                console.log(lastJsonMessage.payload.matches)
                setMatches(lastJsonMessage.payload.matches)
                console.log("lastJsonMessage", lastJsonMessage)
            }
        }
    }, [lastJsonMessage]);


    return <ListGroup>
        {
            matches.map((match)=>{
                return (
                    <Table>
                        <Row>
                            {
                                match.teams.map((team, index) => {
                                    return (
                                        <Col className={"matchHistoryElement " + (match.winner===index ? 'winnerTeam' : 'loserTeam')}>
                                            {
                                                team.map((player) => {
                                                    return (
                                                        <div>
                                                            <PlayerSlot playerName={player.username} selectedChamp={player.champName} lockedIn={false} />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                    </Table>
                )
            })
        }
    </ListGroup>
}