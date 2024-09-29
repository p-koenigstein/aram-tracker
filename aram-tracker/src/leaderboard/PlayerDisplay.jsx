import {Link} from "react-router-dom";


export const PlayerDisplay = ({playername, stats, isTeammate}) => {

    return  <div   className={"playerList shrink defaultPadding "}>
        <Link to={"/profile?player="+playername}>
        {playername} {Math.round(stats.winRate*100)}% ({stats.won}-{stats.lost})
    </Link>
    </div>
}