

export const PlayerDisplay = ({playername, stats, isTeammate}) => {

    return (<div className={"playerList shrink defaultPadding "}>
        {playername} {Math.round(stats.winRate*100)}% ({stats.won}-{stats.lost})
    </div>)
}