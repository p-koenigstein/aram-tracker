import {Button} from "react-bootstrap";
import {Outlet} from "react-router-dom";


export function UserInfo({username, logout}) {

    return <div>
        {username ?
        <div className={"userInfo"}>
            <div className={"userName"}>
                Hello, {username}!
            </div>
            <div className={"logout"}>
                <Button onClick={logout}>Log out</Button>
            </div>
        </div>
    : <div/>
        }
        <Outlet/>
    </div>

}