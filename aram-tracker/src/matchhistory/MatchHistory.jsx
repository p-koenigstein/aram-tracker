import useWebSocket from "react-use-websocket";
import {Button, Col, ListGroup, Row, Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import {PlayerSlot} from "../champselect/ChampionSelect";


export function MatchHistory ({})  {

    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState([]);
    const [page, setPage] = useState(1);

    const matchesPerPage = 4;

    const previousPage = () => {
        if (page>1){
            setPage(page-1)
        }
    }

    const nextPage = () => {
        if (page<Math.ceil(matches.length/matchesPerPage)){
            setPage(page+1)
        }
    }

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


    return (
    <div>
        <ListGroup>
        {
            matches.slice((page-1)*matchesPerPage, page * matchesPerPage).map((match)=>{
                return (
                    <Table className={"matchHistoryEntry"}>
                        <Row>
                            {
                                match.teams.map((team, index) => {
                                    return (
                                        <div className={"matchHistoryElement " + (match.winner===index ? 'winnerTeam' : 'loserTeam')}>
                                            {
                                                team.map((player) => {
                                                    return (
                                                            <PlayerSlot playerName={player.username} selectedChamp={player.champName} lockedIn={false} />
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                        </Row>
                    </Table>
                )
            })
        }
    </ListGroup>
        <div className={"pageNavigation"}>
            <Button onClick={() => previousPage()}>&lt;</Button>
            {
                [...Array(Math.ceil(matches.length/matchesPerPage)).keys()].map(
                    (pageNumber) =>
                        <Button onClick={()=>setPage(pageNumber+1)}>
                            {pageNumber+1}
                        </Button>

                )
            }
            <Button onClick={() => nextPage()}>&gt;</Button>
        </div>

    </div>)
}