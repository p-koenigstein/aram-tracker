import {Link} from "react-router-dom";


export const PlayerDisplay = ({playername, stats, isTeammate}) => {

    return  <Link to={"/profile?player="+playername}  className={"playerList shrink defaultPadding "}>
        {playername} {Math.round(stats.winRate*100)}% ({stats.won}-{stats.lost})
    </Link>
}