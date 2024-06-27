import React from 'react'
import { Container } from 'react-bootstrap';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import * as Icon from 'react-bootstrap-icons';

const Cards = () => {

  return (
        <Container fluid>
            <div className="body-main-1-heading">
                <h3 className="body-main-1-h3">Dashboard</h3>
            </div>
            <div className="body-main-1-content">
                <div className="card-group-div">
                    <div className="card-div">
                        <Card style={{backgroundColor: '#FBEAEF'}} className="card-div-cards">
                            <Card.Body className="card-div-cards-body">
                                <Icon.PersonFill className="card-div-cards-icon"></Icon.PersonFill>
                                <Card.Title className="card-div-cards-title">Users</Card.Title>
                                <Card.Text className="card-div-cards-text">
                                6048
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="card-div">
                        <Card style={{}} className="card-div-cards">
                            <Card.Body>
                                <Card.Title>Users</Card.Title>
                                <Card.Text>
                                6048
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="card-div">
                        <Card style={{}} className="card-div-cards">
                            <Card.Body>
                                <Card.Title>Users</Card.Title>
                                <Card.Text>
                                6048
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="card-div">
                        <Card style={{}} className="card-div-cards">
                            <Card.Body>
                                <Card.Title>Users</Card.Title>
                                <Card.Text>
                                6048
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="card-div">
                        <Card style={{}} className="card-div-cards">
                            <Card.Body>
                                <Card.Title>Users</Card.Title>
                                <Card.Text>
                                6048
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="card-div">
                        <Card style={{}} className="card-div-cards">
                            <Card.Body>
                                <Card.Title>Users</Card.Title>
                                <Card.Text>
                                6048
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </Container>
  )
}
export default Cards;