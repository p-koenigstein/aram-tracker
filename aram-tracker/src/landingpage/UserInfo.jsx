import {Button, Navbar} from "react-bootstrap";
import {Link, Outlet} from "react-router-dom";


export function UserInfo({username, logout}) {

    return <div>
        {username ?

            <div className={"userInfo"}>
                <Navbar>
                    <div>
                    <div className={"userName"}>
                        Hello, {username}!
                    </div>
                    <div className={"logout"}>
                        <Button onClick={logout}>Log out</Button>
                    </div>
                    </div>
            <Link to="/lobby">Lobby</Link>
            <Link to="/leaderboard">Rangliste</Link>
            <Link to="/matchhistory">Spielverlauf</Link>
            </Navbar>

            </div>
            : <div/>
        }
        <Outlet/>
    </div>

}