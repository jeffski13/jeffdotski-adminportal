import React from 'react';
import { FormControl, ControlLabel, FormGroup, DropdownButton, MenuItem, ButtonToolbar } from 'react-bootstrap';
import Indicator from '../aws/Indicator';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import { validateFormString, validateFormPositiveNumber } from '../formvalidation';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../aws/networkConsts';
import { getTrips, getTrip } from '../aws/trips';
import './styles.css';

export default class Trips extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            availableTrips: [],
            tripInfo: null,
            getTripsStatus: null,
            tripCreation: {
                location: '',
                name: '',
                year: -1,
                month: -1
            }
        };
    }

    componentDidMount() {
        //get a list of all the trips when app starts
        this.setState({ getTripsStatus: STATUS_LOADING });
        getTrips((err, tripData) => {
            if (err) {
                console.log(err);
                this.setState({ getTripsStatus: STATUS_FAILURE });
                return;
            }
            this.setState({
                availableTrips: tripData,
                getTripsStatus: STATUS_SUCCESS
            });
        });
    }

    onTripSelected = (tripIndex) => {
        this.setState({
            tripIndexSelected: tripIndex,
            tripInfo: null,
            getTripsStatus: STATUS_LOADING
        }, () => {
            //get list of blogs by trip name from server
            getTrip(this.state.availableTrips[this.state.tripIndexSelected].id, (err, data) => {
                if (err) {
                    console.log(err);
                    this.setState({ getTripsStatus: STATUS_FAILURE });
                    return;
                }
                console.log('jeffski be trippin: ', data);
                this.setState({
                    tripInfo: data,
                    getTripsStatus: STATUS_SUCCESS
                });
            });
        });
    }

    renderTripOptions = (nextTripItem, index) => {
        //default trip name will be  '------' ...just in case
        let tripName = nextTripItem.name ? nextTripItem.name : '-----'
        return (
            <MenuItem
                key={`${index}-${tripName}`}
                eventKey={index}
                onSelect={() => {
                    this.onTripSelected(index)
                }}
            >
                {tripName}
            </MenuItem>
        );
    };

    render() {
        let tripDropdownValue = "Selected Trip";
        if (this.state.tripIndexSelected > -1 && this.state.availableTrips.length > 0) {
            tripDropdownValue = this.state.availableTrips[this.state.tripIndexSelected].name;
        }

        let tripDetailsContent = null;
        if (this.state.tripInfo) {
            tripDetailsContent = (
                <div className="tripInformation" >
                    <h3>Trip Information</h3>
                    <div><strong>Name: </strong>{this.state.tripInfo.name}</div>
                    <div><strong>Location: </strong>{this.state.tripInfo.location}</div>
                    <div><strong>Year: </strong>{this.state.tripInfo.year}</div>
                    <div><strong>Month: </strong>{this.state.tripInfo.month}</div>
                </div>
            );
        }

        return (
            <div className="Trips">
                <div className="existingTrips">
                    <div>
                        <ButtonToolbar>
                            <DropdownButton
                                title={tripDropdownValue}
                                id="trips-dropdown"
                                disabled={this.state.getTripsStatus === STATUS_LOADING}
                            >
                                {this.state.availableTrips.map(this.renderTripOptions)}
                            </DropdownButton>
                            <span>
                                {(this.state.getTripsStatus === STATUS_LOADING)
                                    && <CircularProgress />}
                                {(this.state.getTripsStatus === STATUS_SUCCESS)
                                    && <Indicator success={true} />}
                                {(this.state.getTripsStatus === STATUS_FAILURE)
                                    && <Indicator success={false} />}
                            </span>
                        </ButtonToolbar>
                    </div>
                    {this.state.tripInfo && tripDetailsContent}
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

                </div>

            </div>
        );
    }
}