import React from 'react';
import { ButtonToolbar, Button, Grid, Row, Col } from 'react-bootstrap';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import moment from 'moment';

import Indicator from '../aws/Indicator';
import { validateFormString, validateFormPositiveNumber, FORM_SUCCESS } from '../formvalidation';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../aws/networkConsts';
import { createTrip, updateTrip } from '../aws/trips';
import TripsDropdown from './TripsDropdown';
import TripForm from './TripForm';
import './styles.css';

const TRIP_MODE_CREATE_NEW = 'TRIP_MODE_CREATE_NEW';
const TRIP_MODE_EDIT_EXISTING = 'TRIP_MODE_EDIT_EXISTING';
export default class Trips extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            submitTripStatus: null,
            tripMode: TRIP_MODE_CREATE_NEW,
            createTripResults: {
                status: null,
                message: null,
                code: null
            },
            tripInfo: {
                location: '',
                name: '',
                country: '',
                state: '',
                year: moment().year(),
                month: moment().month() + 1
            },
            refreshTrips: false //toggled whenever we want to refresh trips
        };
    }

    //returns true if the blog is ready to be submitted to the server
    isFormSubmitAllowed() {
        //form should not submit if we are currently uploading anything
        if (this.state.submitTripStatus === STATUS_LOADING) {
            return false;
        }

        if (validateFormString(this.state.tripInfo.location) === FORM_SUCCESS &&
            validateFormString(this.state.tripInfo.name) === FORM_SUCCESS &&
            validateFormPositiveNumber(this.state.tripInfo.year) === FORM_SUCCESS &&
            validateFormPositiveNumber(this.state.tripInfo.month) === FORM_SUCCESS) {
            return true;
        }
        return false;
    }

    onSubmitClicked = () => {
        //set state to loading so user cant submit blog twice
        // and loading indicator appears
        this.setState({
            submitTripStatus: STATUS_LOADING,
            createTripResults: {}
        }, () => {

            let tripFunctionCallback = (err, data) => {
                if (err) {
                    this.setState({
                        submitTripStatus: STATUS_FAILURE,
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
                this.resetTripForm();
                this.setState({
                    submitTripStatus: STATUS_SUCCESS,
                    createTripResults: {
                        message: 'Trip Submitted!'
                    }
                });
            }


            //send request with new blog entry
            if(this.state.tripMode === TRIP_MODE_CREATE_NEW){
                createTrip(this.state.tripInfo, tripFunctionCallback);
            }
            else if(this.state.tripMode === TRIP_MODE_EDIT_EXISTING){
                updateTrip(this.state.tripInfo, tripFunctionCallback);
            }
        });
    }

    resetTripForm = () => {
        this.setState({
            tripMode: TRIP_MODE_CREATE_NEW,
            tripInfo: {
                location: '',
                name: '',
                country: '',
                state: '',
                year: moment().year(),
                month: moment().month() + 1
            },
            refreshTrips: !this.state.refreshTrips
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
                    <h4>Trip Submission Results</h4>
                    <div className="tripServerResultsText" >
                        <div><strong>Message: </strong>{this.state.createTripResults.message}</div>
                        {this.state.createTripResults.code && <div><strong>Code: </strong>{this.state.createTripResults.code}</div>}
                        {this.state.createTripResults.status && <div><strong>Status: </strong>{this.state.createTripResults.status}</div>}
                    </div>
                </div>
            );
        }

        let currentActionMessage = 'Create A New Trip';
        if (this.state.tripMode === TRIP_MODE_EDIT_EXISTING) {
            currentActionMessage = `Editing Trip "${this.state.tripInfo.name}"`;
        }
        return (
            
            <div className="Trips">
                <Button
                    disabled={this.state.tripMode === TRIP_MODE_CREATE_NEW}
                    className="Trips_tripButton"
                    bsStyle="success"
                    onClick={this.resetTripForm}
                >New Trip</Button>
                <TripsDropdown
                    className="Trips_tripButton"
                    refreshProp={this.state.refreshTrips}
                    onTripReturned={(tripInfoReturned) => {
                        this.setState({
                            tripMode: TRIP_MODE_EDIT_EXISTING,
                            tripInfo: tripInfoReturned
                        });
                    }}
                    ref={instance => { this.childTripsDropdown = instance; }}
                />

                <div className="Trips_tripForm">
                    <h3>{currentActionMessage}</h3>

                    <TripForm
                        name={this.state.tripInfo.name}
                        location={this.state.tripInfo.location}
                        country={this.state.tripInfo.country}
                        state={this.state.tripInfo.state}
                        year={this.state.tripInfo.year}
                        month={this.state.tripInfo.month}
                        onTripFormUpdateCallback={(updateTripInfo) => {
                            this.setState({
                                tripInfo: { ...this.state.tripInfo, ...updateTripInfo }
                            });
                        }}

                    />

                    <ButtonToolbar>
                        <Button
                            bsStyle="primary"
                            bsSize="large"
                            onClick={this.onSubmitClicked}
                            disabled={!this.isFormSubmitAllowed()}
                        >Submit</Button>
                        <div>
                            {(this.state.submitTripStatus === STATUS_LOADING)
                                && <CircularProgress />}
                            {(this.state.submitTripStatus === STATUS_SUCCESS)
                                && <Indicator success={true} />}
                            {(this.state.submitTripStatus === STATUS_FAILURE)
                                && <Indicator success={false} />}
                        </div>
                    </ButtonToolbar>
                    {tripCreationServerMessage}
                </div>
            </div>
        );
    }
}