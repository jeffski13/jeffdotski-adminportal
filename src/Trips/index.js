import React from 'react';
import { FormControl, ControlLabel, FormGroup, DropdownButton, MenuItem, ButtonToolbar, Button } from 'react-bootstrap';
import Indicator from '../aws/Indicator';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import { validateFormString, validateFormPositiveNumber, FORM_SUCCESS } from '../formvalidation';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../aws/networkConsts';
import { createTrip } from '../aws/trips';
import './styles.css';
import TripsDropdown from './TripsDropdown';

export default class Trips extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            createTripStatus: null,
            createTripResults: {
                status: null,
                message: null,
                code: null
            },
            tripInfo: null,
            tripCreation: {
                location: '',
                name: '',
                year: 0,
                month: 0
            }
        };
    }

    //returns true if the blog is ready to be submitted to the server
    isFormSubmitAllowed() {
        //form should not submit if we are currently uploading anything
        if (this.state.createTripStatus === STATUS_LOADING) {
            return false;
        }

        if (validateFormString(this.state.tripCreation.location) === FORM_SUCCESS &&
            validateFormString(this.state.tripCreation.name) === FORM_SUCCESS &&
            validateFormPositiveNumber(this.state.tripCreation.year) === FORM_SUCCESS &&
            validateFormPositiveNumber(this.state.tripCreation.month) === FORM_SUCCESS) {
            return true;
        }
        return false;
    }

    onCreatTripClicked = () => {
        //set state to loading so user cant submit blog twice
        // and loading indicator appears
        this.setState({
            createTripStatus: STATUS_LOADING,
            createTripResults: {}
        }, () => {
            //send request with new blog entry
            createTrip(this.state.tripCreation, (err, data) => {
                if (err) {
                    this.setState({
                        createTripStatus: STATUS_FAILURE,
                        createTripResults: {
                            status: err.status,
                            message: err.data.message,
                            code: err.data.code
                        }
                    });
                    return;
                }
                //declare victory! and clear out trip creation stuff
                //refresh trips
                this.childTripsDropdown.getTrips();
                this.setState({
                    createTripStatus: STATUS_SUCCESS,
                    tripCreation: {
                        location: '',
                        name: '',
                        year: 0,
                        month: 0
                    },
                    createTripResults: {
                        message: 'Trip created!'
                    }
                });
            });
        });
    }

    render() {

        let getTripDetailsContent = null;
        if (this.state.tripInfo) {
            getTripDetailsContent = (
                <div className="tripInformation" >
                    <h3>Trip Information</h3>
                    <div><strong>Name: </strong>{this.state.tripInfo.name}</div>
                    <div><strong>Location: </strong>{this.state.tripInfo.location}</div>
                    <div><strong>Year: </strong>{this.state.tripInfo.year}</div>
                    <div><strong>Month: </strong>{this.state.tripInfo.month}</div>
                </div>
            );
        }

        let tripCreationServerMessage = null;
        if (this.state.createTripResults && this.state.createTripResults.message) {
            tripCreationServerMessage = (
                <div className="tripServerResults" >
                    <h4>Trip Create Results</h4>
                    <div className="tripServerResultsText" >
                        <div><strong>Message: </strong>{this.state.createTripResults.message}</div>
                        {this.state.createTripResults.code && <div><strong>Code: </strong>{this.state.createTripResults.code}</div>}
                        {this.state.createTripResults.status && <div><strong>Status: </strong>{this.state.createTripResults.status}</div>}
                    </div>
                </div>
            );
        }

        return (

            <div className="Trips">
                <div className="getTripsSection">
                    <TripsDropdown
                        onTripReturned={(tripInfoReturned) => {
                            this.setState({ tripInfo: tripInfoReturned });
                        }}
                        ref={instance => { this.childTripsDropdown = instance; }}
                    />
                    {this.state.tripInfo && getTripDetailsContent}
                </div>

                <div className="createTripForm">
                    <h3>Create A New Trip</h3>
                    <FormGroup
                        controlId="nameFormInput"
                        validationState={validateFormString(this.state.tripCreation.name)}
                    >
                        <ControlLabel>Name</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.tripCreation.name}
                            placeholder="Enter text"
                            onChange={(e) => {
                                this.setState({
                                    tripCreation: {
                                        ...this.state.tripCreation,
                                        name: e.target.value
                                    }
                                });
                            }}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                    <FormGroup
                        controlId="locationFormInput"
                        validationState={validateFormString(this.state.tripCreation.location)}
                    >
                        <ControlLabel>Location</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.tripCreation.location}
                            placeholder="Enter text"
                            onChange={(e) => {
                                this.setState({
                                    tripCreation: {
                                        ...this.state.tripCreation,
                                        location: e.target.value
                                    }
                                });
                            }}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                    <FormGroup
                        controlId="yearFormInput"
                        validationState={validateFormPositiveNumber(this.state.tripCreation.year)}
                    >
                        <ControlLabel>Year</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.tripCreation.year}
                            placeholder="Enter text"
                            onChange={(e) => {
                                this.setState({
                                    tripCreation: {
                                        ...this.state.tripCreation,
                                        year: e.target.value
                                    }
                                });
                            }}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                    <FormGroup
                        controlId="monthFormInput"
                        validationState={validateFormPositiveNumber(this.state.tripCreation.month)}
                    >
                        <ControlLabel>Month</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.tripCreation.month}
                            placeholder="Enter text"
                            onChange={(e) => {
                                this.setState({
                                    tripCreation: {
                                        ...this.state.tripCreation,
                                        month: e.target.value
                                    }
                                });
                            }}
                        />
                        <FormControl.Feedback />
                    </FormGroup>

                    {/* submit button with network status indicators */}
                    <ButtonToolbar>
                        <Button
                            bsStyle="primary"
                            bsSize="large"
                            onClick={this.onCreatTripClicked}
                            disabled={!this.isFormSubmitAllowed()}
                        >
                            Create Trip
          			</Button>
                        <div>
                            {(this.state.createTripStatus === STATUS_LOADING)
                                && <CircularProgress />}
                            {(this.state.createTripStatus === STATUS_SUCCESS)
                                && <Indicator success={true} />}
                            {(this.state.createTripStatus === STATUS_FAILURE)
                                && <Indicator success={false} />}
                        </div>
                    </ButtonToolbar>
                    {tripCreationServerMessage}
                </div>

            </div>
        );
    }
}