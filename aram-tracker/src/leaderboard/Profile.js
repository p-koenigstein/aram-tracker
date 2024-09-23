import {useSearchParams} from "react-router-dom";

export function Profile ({}) {

    const [searchParams] = useSearchParams()
    const playername = searchParams.get('player')
    console.log(playername)
    return (<div>
        {playername === null ? "My Profile" : playername}
    </div>)
}