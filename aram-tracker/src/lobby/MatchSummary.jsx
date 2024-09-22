import {Col, Row, Table} from "react-bootstrap";
import {PlayerSlot} from "../champselect/ChampionSelect";


export function MatchSummary({lastMatch})  {

    return (
        <div className={"matchHistoryEntry"}>
            <h3>Last Match:</h3>
            <div>
                <div>
                    {
                        lastMatch.teams.map((team, index) => {
                            return (
                            <div className={"matchHistoryElement " + (lastMatch.winner===index ? 'winnerTeam' : 'loserTeam')}>
                                {
                                    Object.keys(team).map((name) => {
                                        let player = team[name]
                                        return (
                                            <div>
                                                <PlayerSlot playerName={player.username} selectedChamp={player.champName} lockedIn={false} />
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}