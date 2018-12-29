import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, FormControl, ControlLabel, FormGroup, DropdownButton, MenuItem, } from 'react-bootstrap';

import { validateFormString, validateFormPositiveNumber, FORM_SUCCESS } from '../../formvalidation';
import './styles.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class TripForm extends React.Component {
    static propTypes = {
        location: PropTypes.string,
        name: PropTypes.string,
        country: PropTypes.string,
        state: PropTypes.string,
        year: PropTypes.number,
        month: PropTypes.number,
        //onTripFormUpdateCallback(updateTripInfo):
        //  updateTripInfo is an object containing a name, country, state, location, year, or month property
        onTripFormUpdateCallback: PropTypes.func.isRequired
    };

    onTripFormUpdate = (updatedStuff) => {
        this.props.onTripFormUpdateCallback(updatedStuff);
    }

    renderMonthsOptions = (nextMonthName, index) => {
        return (
            <MenuItem
                key={nextMonthName + index}
                eventKey={index + 1}
                active={this.props.month === index + 1}
                onSelect={() => {
                    //tell parent we have a new month selected
                    this.onTripFormUpdate({ month: index + 1 });
                }}
            >
                {nextMonthName}
            </MenuItem>
        );
    }

    render() {
        return (
            <form>
                <Grid>
                    <Row className="show-grid">
                        <Col xs={12} md={8}>
                            <FormGroup
                                controlId="nameFormInput"
                                validationState={validateFormString(this.props.name)}
                            >
                                <ControlLabel>Name</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.props.name || ''}
                                    placeholder="Enter text"
                                    onChange={(e) => {
                                        this.onTripFormUpdate({
                                            name: e.target.value
                                        });
                                    }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="show-grid">
                        <Col xs={12} md={8}>
                            <FormGroup
                                controlId="locationFormInput"
                                validationState={validateFormString(this.props.location)}
                            >
                                <ControlLabel>Location</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.props.location || ''}
                                    placeholder="Enter text"
                                    onChange={(e) => {
                                        this.onTripFormUpdate({
                                            location: e.target.value
                                        });
                                    }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="show-grid">
                        <Col xs={12} md={4}>
                            <FormGroup
                                controlId="countryFormInput"
                            >
                                <ControlLabel>Country</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.props.country || ''}
                                    placeholder="Country"
                                    onChange={(e) => {
                                        this.onTripFormUpdate({
                                            country: e.target.value
                                        });
                                    }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={12} md={4}>
                            <FormGroup
                                controlId="stateFormInput"
                            >
                                <ControlLabel>State/Region</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.props.state || ''}
                                    placeholder="Enter text"
                                    onChange={(e) => {
                                        this.onTripFormUpdate({
                                            state: e.target.value
                                        });
                                    }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className="show-grid">
                        <Col xs={12} md={4}>
                            <FormGroup
                                controlId="yearFormInput"
                                validationState={validateFormPositiveNumber(this.props.year)}
                            >
                                <ControlLabel>Year</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.props.year || ''}
                                    placeholder="Enter text"
                                    onChange={(e) => {
                                        this.onTripFormUpdate({
                                            year: e.target.value
                                        });
                                    }}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                        <Col xs={12} md={4}>
                            <FormGroup
                                id="TripForm_monthFormGroup"
                                controlId="monthFormInput"
                                validationState={validateFormPositiveNumber(this.props.month)}
                            >
                                <ControlLabel id="TripForm_monthDropdown" >Month</ControlLabel>
                                    <DropdownButton
                                        id="monthsSelectDropdown"
                                        title={MONTHS[this.props.month - 1]}
                                    >
                                        {MONTHS.map(this.renderMonthsOptions)}
                                    </DropdownButton>
                                <FormControl.Feedback />
                            </FormGroup>
                        </Col>
                    </Row>

                </Grid>
            </form>
        );
    }
}