import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, ButtonToolbar, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

import { getBlogs } from '../aws/blog';
import { getTrips } from '../aws/trips';
import BlogList from './BlogList';

import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../aws/networkConsts';
import Indicator from '../aws/Indicator';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import './styles.css';

class ViewBlogs extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			trip: 'Chile-2017',
			blogData: [],
			status: null,
			availableTrips: [],
			tripIndexSelected: -1
		};
	}

	handleTripInputChange = (e) => {
		this.setState({ trip: e.target.value });
	}

	componentDidMount() {
		//get a list of all the trips when app starts
		this.setState({ status: STATUS_LOADING });
		getTrips((err, data) => {
			if (err) {
				console.log(err);
				this.setState({ status: STATUS_FAILURE });
				return;
			}
			this.setState({
				availableTrips: data,
				status: null
			});
		});
	}

	renderTripOptions = (nextTripItem, index) => {
		return (
			<MenuItem
				key={`${index}-${nextTripItem.name}`}
				eventKey={index}
				onSelect={() => {
					this.onTripSelected(index);
				}}
			>
				{nextTripItem.name}
			</MenuItem>
		);
	}

	onTripSelected = (tripIndex) => {
		this.setState({
			tripIndexSelected: tripIndex,
			status: STATUS_LOADING
		}, () => {
			//get list of blogs by trip name from server
			getBlogs(this.state.availableTrips[this.state.tripIndexSelected].id, (err, data) => {
				if (err) {
					console.log(err);
					this.setState({ status: STATUS_FAILURE });
					return;
				}
				console.log('jeffski be trippin: ', data);
				this.setState({
					blogData: data,
					status: STATUS_SUCCESS
				});
			});
		});
	}

	render() {

		let tripDropdownValue = "Selected Trip";
		if (this.state.tripIndexSelected > -1 && this.state.availableTrips.length > 0) {
			tripDropdownValue = this.state.availableTrips[this.state.tripIndexSelected].name;
		}

		return (
			<div className="ViewBlogs">
				<ButtonToolbar>
					<DropdownButton
						title={tripDropdownValue}
						id="trips-dropdown"
						disabled={this.state.status === STATUS_LOADING}
					>
						{this.state.availableTrips.map(this.renderTripOptions)}
					</DropdownButton>
					<div>
						{(this.state.status === STATUS_LOADING)
							&& <CircularProgress />}
						{(this.state.status === STATUS_SUCCESS)
							&& <Indicator success={true} />}
						{(this.state.status === STATUS_FAILURE)
							&& <Indicator success={false} />}
					</div>
				</ButtonToolbar>
				<BlogList blogsArr={this.state.blogData} />
			</div>
		);
	}
}

export default ViewBlogs;