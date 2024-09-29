

export const PlayerDisplay = ({playername, stats, isTeammate}) => {

    return (<div className={"playerList shrink defaultPadding "}>
        {playername} {stats.winRate*100}% ({stats.won}-{stats.lost})
    </div>)
}