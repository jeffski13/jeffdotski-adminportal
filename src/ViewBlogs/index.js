import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, ButtonToolbar, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import { getBlogs } from '../aws/blog';
import { getTrips } from '../aws/trips';
import BlogList from './BlogList';
import Indicator from '../aws/Indicator';

import './styles.css';

const STATUS_LOADING = 'STATUS_LOADING';
const STATUS_FAILURE = 'STATUS_FAILURE';
const STATUS_SUCCESS = 'STATUS_SUCCESS';

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
				status: STATUS_SUCCESS
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
			getBlogs(this.state.availableTrips[this.state.tripIndexSelected].name, (err, data) => {
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
						bsStyle="ViewBlogs-trips-dropdown"
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