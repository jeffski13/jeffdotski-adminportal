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
			tripId: null,
			getBlogsResults: {
                status: null,
                message: null,
                code: null
            }
		};
	}

	handleTripInputChange = (e) => {
		this.setState({ trip: e.target.value });
	}

	onTripSelected = () => {
		this.setState({
			getBlogsResults: null
		});
	}

	onTripReturned = (tripInfoReturned) => {
		this.setState({
			status: STATUS_LOADING,
			tripId: tripInfoReturned.id,
			blogData: []
		}, ()=>{
			//get list of blogs by trip name from server
			getBlogs(this.state.tripId, (err, data) => {
				if (err) {
					console.log(err);
					this.setState({ 
						status: STATUS_FAILURE,
						getBlogsResults: {
                            status: err.status,
                            message: err.data.message,
                            code: err.data.code
						} 
					});
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

		let getAllBlogsServerMessage = null;
        if (this.state.getBlogsResults && this.state.getBlogsResults.message) {
            getAllBlogsServerMessage = (
                <div className="tripServerResults" >
                    <h4>Get All Blogs Results</h4>
                    <div className="tripServerResultsText" >
                        <div><strong>Message: </strong>{this.state.getBlogsResults.message}</div>
                        {this.state.getBlogsResults.code && <div><strong>Code: </strong>{this.state.getBlogsResults.code}</div>}
                        {this.state.getBlogsResults.status && <div><strong>Status: </strong>{this.state.getBlogsResults.status}</div>}
                    </div>
                </div>
            );
        }

		return (
			<div className="ViewBlogs">
				<TripsDropdown
					sortAlphabetically={false}
					onTripSelected={()=>{
						this.onTripSelected();
					}}
					onTripReturned={(tripInfoReturned) => {
						this.onTripReturned(tripInfoReturned);
					}} />
				<div id="getBlogsIndicator">
					{(this.state.status === STATUS_LOADING)
						&& <CircularProgress />}
					{(this.state.status === STATUS_SUCCESS)
						&& <Indicator success={true} />}
					{(this.state.status === STATUS_FAILURE)
						&& <Indicator success={false} />}
				</div>
				{getAllBlogsServerMessage}
				<BlogList blogsArr={this.state.blogData} />
			</div>
		);
	}
}

export default ViewBlogs;