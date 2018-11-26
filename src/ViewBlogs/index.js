import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, ButtonToolbar, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import Indicator from '../aws/Indicator';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../aws/networkConsts';
import { getBlogs } from '../aws/blog';
import BlogList from './BlogList';
import TripsDropdown from '../Trips/TripsDropdown'
import './styles.css';

class ViewBlogs extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			trip: 'Chile-2017',
			blogData: [],
			status: null,
			tripId: null
		};
	}

	handleTripInputChange = (e) => {
		this.setState({ trip: e.target.value });
	}

	onTripSelected = () => {
		this.setState({
			status: STATUS_LOADING,
			blogData: []
		}, ()=>{
			//get list of blogs by trip name from server
			getBlogs(this.state.tripId, (err, data) => {
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

		return (
			<div className="ViewBlogs">
				<TripsDropdown
					sortAlphabetically={false}
					onTripReturned={(tripInfoReturned) => {
						this.setState({
							tripId: tripInfoReturned.id
						});
						this.onTripSelected();
					}} />
				<div id="getBlogsIndicator">
					{(this.state.status === STATUS_LOADING)
						&& <CircularProgress />}
					{(this.state.status === STATUS_SUCCESS)
						&& <Indicator success={true} />}
					{(this.state.status === STATUS_FAILURE)
						&& <Indicator success={false} />}
				</div>
				<BlogList blogsArr={this.state.blogData} />
			</div>
		);
	}
}

export default ViewBlogs;