import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {Button, Col, Row, Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import sort_1 from '../resources/icons/sort_1.png'
import sort_2 from '../resources/icons/sort_2.png'

export function LeaderBoard({username}) {

    const [leaderboard, setLeaderboard] = useState([]);
    const [reverse, setReverse] = useState(false);

    const sortWinrate = (p1, p2) => {
        return p1.winRate - p2.winRate;
    }

    const sortPlayerName = (p1,p2) => {
        return p1.username.localeCompare(p2.username);
    }

    const sortGameAmount = (p1,p2) => {
        return p1.matchCount - p2.matchCount;
    }

    const [sortFn, setSortFn] = useState(() => sortWinrate);


    const changeSortFunction = (newFunction) => {
        if (sortFn.name === newFunction.name) {
            setReverse(!reverse)
        }
        else{
            setSortFn(() => newFunction)
            setReverse(false)
        }
        let newLeaderBoard = leaderboard.sort(newFunction)
        if (!reverse){
            newLeaderBoard = newLeaderBoard.reverse()
        }
        setLeaderboard(newLeaderBoard)
    }

    const renderFilterIcon = (sortType) =>{
        if (sortFn.name === sortType){
            let imgSrc = reverse?"../resources/icons/sort_1.png" : "../resources/icons/sort_2.png"
            return <img className={"filterslot"} src={reverse?sort_1:sort_2} alt={"sort"} />
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
    }, []);

    useEffect(() => {
        if (lastJsonMessage !== null){
            switch (lastJsonMessage.action){
                case "leaderBoardAnswer":
                    setLeaderboard(lastJsonMessage.payload.sort(sortFn))
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
            </Row>
            {leaderboard.map((player) => (
                <Row className={"leaderboardEntry"}>
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
                </Row>
            ))}
        </Table>
    )
}