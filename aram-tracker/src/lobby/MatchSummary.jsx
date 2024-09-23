import {Col, Row, Table} from "react-bootstrap";
import {PlayerSlot} from "../champselect/ChampionSelect";
import {Match} from "../matchhistory/MatchHistory";


export function MatchSummary({lastMatch})  {

    return (
        <div className={"matchHistoryEntry"}>
            <h3>Last Match:</h3>
            <Match match={lastMatch}/>
        </div>
    )
}