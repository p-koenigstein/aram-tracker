import {Button, Navbar} from "react-bootstrap";
import {Link, Outlet} from "react-router-dom";


export function UserInfo({username, logout}) {

    return <div>
        {username ?

            <div className={"userInfo"}>
                <Navbar>
                    <div>
                        <Link to="/lobby">Lobby</Link>
                        <Link to="/leaderboard">Rangliste</Link>
                        <Link to="/matchhistory">Spielverlauf</Link>
                        <div className={"logout"}>
                            <div className={"userName"}>
                            Logged in as {username}
                            </div>
                            <Button onClick={logout}>Log out</Button>
                        </div>
                    </div>
                </Navbar>

            </div>
            : <div/>
        }
        <Outlet/>
    </div>

}