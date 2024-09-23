import {Button, Navbar} from "react-bootstrap";
import {Link, Outlet} from "react-router-dom";
import {Switch} from "@mui/material";


export function UserInfo({username, logout, toggleDarkMode, useDarkMode}) {

    return <div>
        {username ?

            <div className={"userInfo"}>
                <Navbar>
                    <div>
                        <Link to="/lobby">Lobby</Link>
                        <Link to="/leaderboard">Rangliste</Link>
                        <Link to="/matchhistory">Spielverlauf</Link>
                        <Link to="/profile">Profile</Link>
                        <div className={"logout"}>
                            Dark <Switch onChange={toggleDarkMode} checked={useDarkMode}/>
                            <div className={"userName"}>
                            Logged in as {username}
                            </div>
                            <Button variant={"outline-danger"} onClick={logout}>Log out</Button>
                            &nbsp;
                        </div>
                    </div>
                </Navbar>

            </div>
            : <div/>
        }
        <Outlet/>
    </div>

}