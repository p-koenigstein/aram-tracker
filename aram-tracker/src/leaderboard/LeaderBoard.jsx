import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {Button, Col, Row, Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import sort_1 from '../resources/icons/sort_1.png'
import sort_2 from '../resources/icons/sort_2.png'

export function LeaderBoard({username}) {

    const [leaderboard, setLeaderboard] = useState([]);
    const [reverse, setReverse] = useState(true);

    const sortWinrate = (p1, p2) => {
        return p1.winRate - p2.winRate;
    }

    const sortElo1v1 = (p1,p2) => {
        return p1.elo1v1 - p2.elo1v1
    }

    const sortElo = (p1,p2) => {
        return p1.elo - p2.elo
    }

    const sortPlayerName = (p1,p2) => {
        return p1.username.localeCompare(p2.username);
    }

    const sortGameAmount = (p1,p2) => {
        return p1.matchCount - p2.matchCount;
    }

    const [sortFn, setSortFn] = useState(() => sortElo);


    const changeSortFunction = (newFunction) => {
        if (sortFn.name === newFunction.name) {
            setReverse(!reverse)
        }
        else{
            setSortFn(() => newFunction)
        }
        let newLeaderBoard = leaderboard.sort(newFunction)
        if (!reverse){
            newLeaderBoard = newLeaderBoard.reverse()
        }
        setLeaderboard(newLeaderBoard)
    }

    const renderFilterIcon = (sortType) =>{
        if (sortFn.name === sortType){
            return reverse ? <div className={"filterslot"}>&darr;</div> : <div className={"filterslot"}>&uarr;</div>;
        }
        return <div className={"filterslot"}/>
    }

    const WS_URL = process.env.REACT_APP_WS_URL;
    const {sendJsonMessage, lastJsonMessage} = useWebSocket(WS_URL,
        {
            share:true,
            queryParams: {username}
        })

    useEffect(() => {
        sendJsonMessage({action:"requestLeaderboard"})
        setSortFn(() => sortElo)
    }, []);

    useEffect(() => {
        if (lastJsonMessage !== null){
            switch (lastJsonMessage.action){
                case "leaderBoardAnswer":
                    let newLeaderboard = lastJsonMessage.payload.sort(sortFn)
                    if(reverse){
                        newLeaderboard = newLeaderboard.reverse()
                    }
                    setLeaderboard(newLeaderboard)
                    break;
            }
        }
    }, [lastJsonMessage]);

    return(
        <Table>
            <Row className={"leaderboard-header"}>
                <Col>
                    <div  className={"horiz"} onClick = {() => changeSortFunction(sortPlayerName)}>
                    <label>{renderFilterIcon('sortPlayerName')} &nbsp;Player name </label>
                    </div>
                </Col>
                <Col>
                    <div  className={"horiz"} onClick={() => changeSortFunction(sortWinrate)}>
                    <label>{renderFilterIcon('sortWinrate')} &nbsp;
                        Win rate </label>
                    </div>
                </Col>
                <Col>
                    <div className={"horiz"} onClick={() => changeSortFunction(sortGameAmount)}>
                    <label> {renderFilterIcon('sortGameAmount')} &nbsp;Games</label>
                    </div>
                </Col>
                <Col>
                    <div className={"horiz"} onClick={() => changeSortFunction(sortElo)}>
                        <label> {renderFilterIcon('sortElo')} &nbsp; Elo </label>
                    </div>
                </Col>
                <Col>
                    <div className={"horiz"} onClick={() => changeSortFunction(sortElo1v1)}>
                        <label> {renderFilterIcon('sortElo1v1')} &nbsp; Elo 1v1</label>
                    </div>
                </Col>
            </Row>
            {leaderboard.map((player) => (
                <Row className={"leaderboardEntry"} key={player.username}>
                    <Col>
                        <div  className={"horiz"}>
                            <Link to={"/profile?player="+player.username}> {player.username}</Link>
                        </div>
                    </Col>
                    <Col>
                        <div className={"horiz"}>
                        {Math.round(player.winRate * 100)}%
                        </div>
                    </Col>
                    <Col>
                        <div className={"horiz"}>

                        {player.matchCount}
                        </div>
                    </Col>
                    <Col>
                        <div className={"horiz"}>
                            {player.elo}
                        </div>
                    </Col>
                    <Col>
                        <div className={"horiz"} >
                            {player.elo1v1}
                        </div>
                    </Col>
                </Row>
            ))}
        </Table>
    )
}