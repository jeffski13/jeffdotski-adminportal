import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import moment from 'moment';

import { validateFormString, validateDate, FORM_SUCCESS } from '../formvalidation';
import BlogEntryFormGenerator from './BlogEntryFormGenerator';
import ImageCarousel from './ImageCarousel';
import AWS from 'aws-sdk';
import { AWS_S3_REGION, AWS_IDENTITY_POOL_ID_AWS_ACCESS } from '../configski';
import { uploadPhoto } from '../aws/photo';
import { uploadBlog } from '../aws/blog';
import { getTrips } from '../aws/trips';
import './styles.css';
import Indicator from '../aws/Indicator';
import Completeit from './Completeit';

//statuses for all the things (blog images, title image, blog data) we will be uploading to the server
const STATUS_SUCCESS = 'STATUS_SUCCESS';
const STATUS_FAILURE = 'STATUS_FAILURE';
const STATUS_LOADING = 'STATUS_LOADING';

/*
parent/master class for writing a blog.
contains form elements required for a blog. (see other BlogEntryFormGenerator component for optional blog forms).
in charge of finalizing all information and sending it to the server.
*/
class WriteBlog extends Component {

	constructor(props, context) {
		super(props, context);

		//initialize the AWS S3 SDK connection object
		AWS.config.update({
			region: AWS_S3_REGION,
			credentials: new AWS.CognitoIdentityCredentials({
				IdentityPoolId: AWS_IDENTITY_POOL_ID_AWS_ACCESS
			})
		});
		let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

		this.state = {
			trip: '',
			location: 'TestCity',
			date: moment().startOf('day'),
			title: 'TestLoco',
			titleImage: {},
			titleImageUrl: null,
			blogtext: [],
			blogImages: {
				imgFiles: []
			},
			blogImagesUrls: [],
			blogImagesStatusArr: [],
			photoStatus: null, //status for both blog photos and title photo
			blogStatus: null, //status for blog data
			awsS3: s3,
			availableTrips: []
		};
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
			//transform trips into string array for auto suggest
			let tripArr = [];
			data.map((nextTrip) => {
				tripArr.push(nextTrip.name);
			});
			this.setState({
				availableTrips: tripArr,
				status: null
			});
		});
	}

	//form data binding
	handleDateChange = (date) => {
		this.setState({ date: date });
	}
	
	handleTitleChange = (e) => {
		this.setState({ title: e.target.value });
	}

	handleParagraphsChange = (e) => {
		this.setState({ paragraphs: e.target.value });
	}

	handleLocationChange = (e) => {
		this.setState({ location: e.target.value });
	}

	handleImgFileChange = (e) => {
		this.setState({ titleImage: e.target.files[0] });
	}

	//upload photo/blog to server
	onUploadBlogClicked = () => {

		//initialize variables for loading progress
		let initializedBlogImagesUploadStatusArr = [];
		let initializedBlogImageUrls = [];

		if(this.state.blogImages.imgFiles !== undefined){
			for(let i =0; i < this.state.blogImages.imgFiles.length; i++){
				initializedBlogImagesUploadStatusArr.push(STATUS_LOADING);
				initializedBlogImageUrls.push({
					url: '',
					imageTitle: '',
					imageDescription: ''
				});
			}
		}
		
		//set state to loading so user cant submit blog twice
		// and loading indicator appears
		this.setState({
			blogStatus: STATUS_LOADING,
			photoStatus: STATUS_LOADING,
			blogImagesStatusArr: initializedBlogImagesUploadStatusArr,
			blogImagesUrls: initializedBlogImageUrls
		}, () => {
			//when we are done initializing state for upload, well...start the upload!
			this.uploadBlog_blogImages();
		});
	}

	//uploads all blog images (these images are optional)
	uploadBlog_blogImages = () => {

		//if no images, go ahead and upload the rest of the blog stuff
		if(this.state.blogImages.imgFiles.length === 0){
			this.uploadBlog_titleImage();
		}

		//upload all blog images
		for (let i = 0; i < this.state.blogImages.imgFiles.length; i++) {
            //upload the file
            uploadPhoto(this.state.blogImages.imgFiles[i], this.state.trip, this.state.awsS3, (err, uploadedImgData) => {
                //error handling
				let imgStatusArr = [...this.state.blogImagesStatusArr];
				let imgUrlArr = [...this.state.blogImagesUrls];

                if (err) {
					imgStatusArr[i] = STATUS_FAILURE;
				}
				else{
					//success: set status and fetch fresh list of all uploaded photos
					imgStatusArr[i] = STATUS_SUCCESS;
					imgUrlArr[i].url = uploadedImgData.Location;
					imgUrlArr[i].imageTitle = this.state.blogImages.imgMetaData[i].imageTitle;
					imgUrlArr[i].imageDescription = this.state.blogImages.imgMetaData[i].imageDescription;
				}
				this.setState({
					blogImagesStatusArr: imgStatusArr,
					blogImagesUrls: imgUrlArr
				},() => {
					//if we have not failed already, go move forward with the uploading step
					if(this.state.photoStatus === STATUS_LOADING){
						this.uploadBlog_titleImage();
					}
				});
            });
        }
	}
	
	//uploads the title image of the blog (title image is required)
	uploadBlog_titleImage = () => { 
		//check to make sure all blog images were uploaded successfully
		for(let i = 0; i < this.state.blogImagesStatusArr.length; i++){
			if(this.state.blogImagesStatusArr[i] === STATUS_FAILURE){
				//we have failed, sad day
				this.setState({
					photoStatus: STATUS_FAILURE,
					blogStatus: null
				});
				return;
			}
			if(this.state.blogImagesStatusArr[i] === STATUS_LOADING){
				//we are still loading blog images. 
				return;
			}
		}

		//upload photo first, then include photo location when uploading blog 
		uploadPhoto(this.state.titleImage, this.state.trip, this.state.awsS3, (err, uploadedImageData) => {
			////////////////////////////////
			//upload photo call complete
			////////////////////////////////
			//error handling
			if (err) {
				this.setState({
					photoStatus: STATUS_FAILURE,
					blogStatus: null
				});
				return;
			}
			this.setState({
				photoStatus: STATUS_SUCCESS,
				titleImageUrl: uploadedImageData.Location
			});

			this.uploadBlog_blogData();
		});
	}
	
	uploadBlog_blogData = () => {
		//send request with new blog entry
		let blogdata = {
			trip: this.state.trip,
			title: this.state.title,
			location: this.state.location,
			date: moment(this.state.date.valueOf()).unix(),
			titleImage: this.state.titleImageUrl,
			blogContent: this.state.blogtext,
			blogImages: this.state.blogImagesUrls
		}
		
		uploadBlog(blogdata, (err, data) => {
			////////////////////////////////
			//upload blog call complete
			////////////////////////////////
			console.log('jeffski, blog upload complete data:', data, ' error', err);
			if(err){
				this.setState({ 
					blogStatus: STATUS_FAILURE,
					photoStatus: null 
				});
				return;
			}
			this.setState({ blogStatus: STATUS_SUCCESS }, ()=>{
				console.log('jeffski state after upload: ', this.state);
			});
		});

	}

	storeBlogTextFromChildForm = (blogTextData) => {
		this.setState({ blogtext: blogTextData });
	}

	//returns true if the blog is ready to be submitted to the server
	isFormSubmitAllowed() {
		//form should not submit if we are currently uploading anything
		if(this.state.blogStatus === STATUS_LOADING || this.state.photoStatus === STATUS_LOADING){
			return false;
		}

		if (validateFormString(this.state.title) === FORM_SUCCESS &&
			validateFormString(this.state.trip) === FORM_SUCCESS &&
			validateFormString(this.state.titleImage.name) === FORM_SUCCESS &&
			validateDate(moment(this.state.date.valueOf()).unix()) === FORM_SUCCESS &&
			validateFormString(this.state.location) === FORM_SUCCESS) {
			return true;
		}
		return false;
	}

	getTitleImageSize = () => {
		if(this.state.titleImage.size){
			let finalStr = this.state.titleImage.size;
			finalStr = finalStr / 1000;
			return ' ' + finalStr + ' kB'
		}
	}

	storeCarouselImages = (imgData) => {
		this.setState({blogImages: imgData});
	}

	renderBlogUploadStatusMessage = () => {
		//we upload photos first
		if(this.state.photoStatus === STATUS_LOADING){
			let blogPhotosInProgressCount = 0;
			let blogPhotosSuccessCount = 0;
			this.state.blogImagesStatusArr.forEach((nextStatus) => {
				if(nextStatus === STATUS_LOADING){
					blogPhotosInProgressCount++;
				}
				if(nextStatus === STATUS_SUCCESS){
					blogPhotosSuccessCount++;
				}
			});

			if(blogPhotosInProgressCount > 0){
				return (
					<div>Uploaded {blogPhotosSuccessCount} of {this.state.blogImagesStatusArr.length}</div>
				);
			}
			else{
				return (
					<div>Uploading Title Photo</div>
				);
			}
		}
		if(this.state.blogStatus === STATUS_LOADING){
			return (
				<div>Uploading Blog Data</div>
			);
		}
		return null;
	}

	render() {
		return (
			<div className="WriteBlog">
				{/* minimum information required for blog (trip, title, date, location) */}
				<div className="form-group">
					<DatePicker
						selected={this.state.date}
						onChange={this.handleDateChange}
						className="form-control"
					/>
				</div>
				<form>
					<FormGroup
						controlId="WriteBlog-tripFormInput"
						validationState={validateFormString(this.state.trip)}
					>
						<ControlLabel>Trip</ControlLabel>
						<Completeit
							suggestions={this.state.availableTrips}
							userInputChangedCallback={(tripInput) => {
								this.setState({
									trip: tripInput
								});
							}}  
						/>
					</FormGroup>
					<FormGroup
						controlId="locationFormInput"
						validationState={validateFormString(this.state.location)}
					>
						<ControlLabel>Location</ControlLabel>
						<FormControl
							type="text"
							value={this.state.location}
							placeholder="Enter text"
							onChange={this.handleLocationChange}
						/>
						<FormControl.Feedback />
					</FormGroup>
					<FormGroup
						controlId="titleFormInput"
						validationState={validateFormString(this.state.title)}
					>
						<ControlLabel>Title</ControlLabel>
						<FormControl
							type="text"
							value={this.state.title}
							placeholder="Enter text"
							onChange={this.handleTitleChange}
						/>
						<FormControl.Feedback />
					</FormGroup>

					<FormGroup
						controlId="imageSelectForm"
						validationState={validateFormString(this.state.titleImage.name)}
						>
						<ControlLabel>Title Image</ControlLabel>
						<div className="WriteBlog__file_details" >
							<FormControl
								type="file"
								placeholder="Choose Image File"
								onChange={this.handleImgFileChange}
								/>
							<strong className="WriteBlog__file_size" >
								{this.getTitleImageSize()}
							</strong>
						</div>
					</FormGroup>
				</form>

				{/*form where you can dynamically create blog content (paragraphs, bullet list, etc.) */}
				<BlogEntryFormGenerator
					getBlogTextData={(data) => { this.storeBlogTextFromChildForm(data) }}
				/>

				{/* insert carousel here */}
				<ImageCarousel 
					imageSelectedCallback={(imgData) => {
						//NOTE to implementing components: 
						//formDataCallback can/should be called with data parameter as null if form data is invalid
						this.storeCarouselImages(imgData)
					}}
				/>

				{/* submit button with network status indicators */}
				<ButtonToolbar>
					<Button
						bsStyle="primary"
						bsSize="large"
						onClick={this.onUploadBlogClicked}
						disabled={!this.isFormSubmitAllowed()}
					>
						Upload Blog
          			</Button>
					<div>
						{(this.state.blogStatus === STATUS_LOADING || this.state.photoStatus === STATUS_LOADING)
							&& <CircularProgress />}
						{(this.state.blogStatus === STATUS_SUCCESS && this.state.photoStatus === STATUS_SUCCESS)
							&& <Indicator success={true} />}
						{(this.state.blogStatus === STATUS_FAILURE || this.state.photoStatus === STATUS_FAILURE)
							&& <Indicator success={false} />}
						{this.renderBlogUploadStatusMessage()}
					</div>
				</ButtonToolbar>
			</div>
		);
	}
}

export default WriteBlog;