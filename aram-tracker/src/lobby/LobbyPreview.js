import {Button, Col, ListGroup, ListGroupItem, Row, Table} from "react-bootstrap";

export function LobbyPreview({teams, shuffle, startGame}) {

    return(
        <div className={"horiz defaultPadding"}>
            <Table className={"shrink"}>
                <Row className={"horiz"}>
                    <div>
                        Teams
                    </div>
                </Row>
                <Row className={"shrink"}>
            {teams.map((team, index) => (
                <Col className={"shrink"}>
                    <Row className={"shrink"}>
                    Team {index +1}
                    </Row>
                    <Row className={"shrink"}>
                        <ListGroup>
                        {team.map((player)=>
                            <ListGroupItem className={"playerList"}>
                                {player.username}
                            </ListGroupItem>
                        )}
                        </ListGroup>
                    </Row>
                </Col>
            ))}
                </Row>
                <Row className={"horiz"}>
                    <Button className={"shrink defaultMargin"} variant={"outline-warning"} onClick={() => shuffle()}>
                        Teams durchwürfeln
                    </Button>
                    <Button className={"shrink defaultMargin"} variant={"outline-success"} onClick={() => startGame()}>
                        Starten
                    </Button>
                </Row>
            </Table>
        </div>
    )
}