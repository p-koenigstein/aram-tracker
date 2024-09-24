import useWebSocket from "react-use-websocket";
import {Button, Col, ListGroup, Row, Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import {PlayerSlot} from "../champselect/ChampionSelect";
import {Link} from "react-router-dom";


export function MatchHistory ({})  {

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
                setMatches(lastJsonMessage.payload.matches)
            }
        }
    }, [lastJsonMessage]);


    return (<MatchList matches={matches}/>)
}

export function MatchList({matches}) {

    const [page, setPage] = useState(1);
    const buttonVariant = "secondary"

    const matchesPerPage = 5;

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

    return (
        <div className={"matchHistory"}>
            <div>
                {
                    matches.slice((page-1)*matchesPerPage, page * matchesPerPage).map((match)=>
                        <Match match={match} key={match._id}/> )
                }
            </div>
            <div className={"pageNavigation"}>
                <Button onClick={() => setPage(Math.max(1,page - 5))} variant={buttonVariant}>&lt;&lt;</Button>
                <Button onClick={() => previousPage()} variant={buttonVariant}>&lt;</Button>
                {
                    [...Array(Math.ceil(matches.length/matchesPerPage)).keys()].map(
                        (pageNumber) =>
                            <Button onClick={()=>setPage(pageNumber+1)} variant={pageNumber+1 === page?"warning":buttonVariant} key={"pg_"+pageNumber}>
                                {pageNumber+1}
                            </Button>

                    )
                }
                <Button onClick={() => nextPage()} variant={buttonVariant}>&gt;</Button>
                <Button onClick={() => setPage(Math.min(Math.ceil(matches.length/matchesPerPage),page + 5))} variant={buttonVariant}>&gt;&gt;</Button>
            </div>

        </div>)
}

export function Match ({match}) {


    const renderMatchDate = (date) => {
        let realDate = new Date(date)
        return realDate.toLocaleDateString('de-DE') + " " + realDate.getHours() + ":" +realDate.getMinutes()
    }
    return (
        <div className={"matchHistoryEntry"}>
            <h5 className={"horiz"}>
                {renderMatchDate(match.timestamp)}
            </h5>
                <div>
                {
                    match.teams.map((team, index) => {
                        return (
                            <div className={"matchHistoryElement " + (match.winner===index ? 'winnerTeam' : 'loserTeam')} key={match._id+"_"+index}>
                                {
                                    team.map((player) => {
                                        return (<Link to={"/profile?player="+player.username} key={match._id+"_"+index+"_"+player.username}>
                                            <PlayerSlot playerName={player.username} selectedChamp={player.champName} lockedIn={false} />
                                            </Link>
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}