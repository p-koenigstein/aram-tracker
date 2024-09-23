import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {Button, Col, Row, Table} from "react-bootstrap";

export function LeaderBoard({username}) {

    const [leaderboard, setLeaderboard] = useState([]);
    const [reverse, setReverse] = useState(false);

    const sortWinrate = (p1, p2) => {
        return p2.winRate - p1.winRate;
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
            console.log(lastJsonMessage)
            switch (lastJsonMessage.action){
                case "leaderBoardAnswer":
                    setLeaderboard(lastJsonMessage.payload.sort(sortFn))
                    break;
            }
        }
    }, [lastJsonMessage]);

    return(
        <Table>
            <Row>
                <Col>
                    <div  className={".horiz"} onClick = {() => changeSortFunction(sortPlayerName)}>
                    <label>Player name </label>
                    </div>
                </Col>
                <Col>
                    <div  className={".horiz"} onClick={() => changeSortFunction(sortWinrate)}>
                    <label>
                        Win rate</label>
                    </div>
                </Col>
                <Col>
                    <div className={".horiz"} onClick={() => changeSortFunction(sortGameAmount)}>
                    <label>Games</label>
                    </div>
                </Col>
            </Row>
            {leaderboard.map((player) => (
                <Row>
                    <Col>
                        <div  className={".horiz"}>

                        {player.username}
                        </div>
                    </Col>
                    <Col>
                        <div className={".horiz"}>

                        {Math.round(player.winRate * 100)}%
                        </div>
                    </Col>
                    <Col>
                        <div className={".horiz"}>

                        {player.matchCount}
                        </div>
                    </Col>
                </Row>
            ))}
        </Table>
    )
}