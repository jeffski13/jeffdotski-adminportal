import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, ButtonToolbar, Button, DropdownButton, MenuItem } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CircularProgress from 'material-ui/Progress/CircularProgress';
import moment from 'moment';
import { Prompt } from 'react-router-dom';

import { validateFormString, validateDate, FORM_SUCCESS } from '../formvalidation';
import BlogEntryFormGenerator from './BlogEntryFormGenerator';
import ImageCarousel from './ImageCarousel';
import AWS from 'aws-sdk';
import { AWS_S3_REGION, AWS_IDENTITY_POOL_ID_AWS_ACCESS } from '../configski';
import { uploadPhoto } from '../aws/photo';
import { uploadBlog } from '../aws/blog';
import { getTrips } from '../aws/trips';
import Indicator from '../aws/Indicator';
import TripsDropdown from '../Trips/TripsDropdown';
import TitleImageForm from './TitleImageForm';
import ResizeImg from '../UploadImage/ResizeImg';
import SingleImageUpload from '../UploadImage/SingleImageUpload';
import { secondsPerHour } from './date-consts';
import './styles.css';

//statuses for all the things (blog images, title image, blog data) we will be uploading to the server
const STATUS_SUCCESS = 'STATUS_SUCCESS';
const STATUS_FAILURE = 'STATUS_FAILURE';
const STATUS_LOADING = 'STATUS_LOADING';

const timeOfDayArr = [
    {
        name: 'None',
        hour: 0,
        readableTime: '0:00 am'
    },
    {
        name: 'Morning',
        hour: 8,
        readableTime: '8:00 am'
    },
    {
        name: 'Afternoon',
        hour: 12,
        readableTime: '12:00 pm'
    },
    {
        name: 'Evening',
        hour: 18,
        readableTime: '6:00 pm'
    },
    {
        name: 'Night',
        hour: 22,
        readableTime: '10:00 pm'
    }
];

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
            tripId: null,
            country: '',
            state: '',
            location: '',
            date: moment().startOf('day'),
            timeOfDaySelected: null,
            title: '',
            titleImage: {},
            titleImageUrl: null,
            blogtext: [],
            blogImages: {
                imgFiles: []
            },
            blogImagesUrls: [],
            blogImagesStatusArr: [],
            blogImagesThumbnailStatusArr: [],
            titleImgNetworkStatus: null, //status for both blog photos and title photo
            blogStatus: null, //status for blog data
            networkStatusErrorMesage: '',
            awsS3: s3,
            availableTrips: [],
            formRefreshProp: false
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

    handleCountryChange = (e) => {
        this.setState({ country: e.target.value });
    }

    handleStateChange = (e) => {
        this.setState({ state: e.target.value });
    }

    handleLocationChange = (e) => {
        this.setState({ location: e.target.value });
    }
    
    //upload photo/blog to server
    onUploadBlogClicked = () => {
        //when we are done initializing state for upload, well...start the upload!
        this.uploadBlog_blogImages((errMsg) => {
            if (errMsg) {
                this.setState({
                    networkStatusErrorMesage: errMsg
                });
                return;
            }
            else {
                // do nothing here. Uploading continues in another method
                // Need to wait until thumbnails and images are done to continue
            }
        });
    }

    //uploads all blog images (these images are optional)
    uploadBlog_blogImages = (callback) => {

        //if no images we are all done here!
        if (this.state.blogImages.imgFiles.length === 0) {
            this.onBlogOrThumbnailImageUploaded();
        }

        //initialize variables for loading progress
        let initializedBlogImagesUploadStatusArr = [];
        let initializedBlogImagesThumbnailUploadStatusArr = [];
        let initializedBlogImageUrls = [];

        if (this.state.blogImages.imgFiles !== undefined) {
            for (let i = 0; i < this.state.blogImages.imgFiles.length; i++) {
                initializedBlogImagesUploadStatusArr.push(STATUS_LOADING);
                initializedBlogImagesThumbnailUploadStatusArr.push(STATUS_LOADING);
                initializedBlogImageUrls.push({
                    url: '',
                    thumbnailUrl: '',
                    imageTitle: '',
                    imageDescription: '',
                    fileIndex: i
                });
            }
        }

        //set state to loading so user cant submit blog twice
        // and loading indicator appears
        // Set loading state for thumbnails so that those start uploading
        this.setState({
            blogImagesStatusArr: initializedBlogImagesUploadStatusArr,
            blogImagesThumbnailStatusArr: initializedBlogImagesThumbnailUploadStatusArr,
            blogImagesUrls: initializedBlogImageUrls
        }, () => {
            //upload all blog images
            for (let i = 0; i < this.state.blogImages.imgFiles.length; i++) {
                //upload the file
                uploadPhoto(this.state.blogImages.imgFiles[i], this.state.tripId, (err, uploadedImgData) => {
                    //error handling
                    let imgStatusArr = [...this.state.blogImagesStatusArr];
                    let imgUrlArr = [...this.state.blogImagesUrls];

                    if (err) {
                        console.log("Error in while uploading blog image: ", err);
                        imgStatusArr[i] = STATUS_FAILURE;
                    }
                    else {
                        //success: set status and fetch fresh list of all uploaded photos
                        imgStatusArr[i] = STATUS_SUCCESS;
                        imgUrlArr[i].url = uploadedImgData.Location;
                        imgUrlArr[i].imageTitle = this.state.blogImages.imgMetaData[i].imageTitle;
                        imgUrlArr[i].imageDescription = this.state.blogImages.imgMetaData[i].imageDescription;
                    }
                    this.setState({
                        blogImagesStatusArr: imgStatusArr,
                        blogImagesUrls: imgUrlArr
                    }, () => {
                        //if we are done loading all images check for errors
                        if (!this.state.blogImagesStatusArr.includes(STATUS_LOADING)) {
                            if (this.state.blogImagesStatusArr.includes(STATUS_FAILURE)) {
                                // Failure (in the original super smash narrator voice)
                                callback("ERROR: failure while uploading photos");
                                return;
                            }
                            if (!this.state.blogImagesStatusArr.includes(STATUS_FAILURE) && !this.state.blogImagesStatusArr.includes(STATUS_LOADING)) {
                                //if, go move forward with the uploading step
                                this.onBlogOrThumbnailImageUploaded();
                            }
                        }
                    });
                });
            }
        });
    }

    onThumbnailUploadComplete = (errData, thumbnailData) => {
        let thumbnailStatusArr = this.state.blogImagesThumbnailStatusArr;
        let index = -1;
        if (errData) {
            console.log("error uploading ", errData.filename, " with error ", errData.error);
            index = errData.index;
            thumbnailStatusArr[index] = STATUS_FAILURE;
            this.setState({
                blogImagesThumbnailStatusArr: thumbnailStatusArr
            }, () => {
                this.onBlogOrThumbnailImageUploaded();
            });
            return;
        }
        else {
            let index = thumbnailData.index;
            let blogImagesDataArr = this.state.blogImagesUrls;
            thumbnailStatusArr[index] = STATUS_SUCCESS;
            blogImagesDataArr[index].thumbnailUrl = thumbnailData.url;
            this.setState({
                blogImagesThumbnailStatusArr: thumbnailStatusArr,
                blogImagesUrls: blogImagesDataArr
            }, () => {
                this.onBlogOrThumbnailImageUploaded();
            });
        }
    };

    onBlogOrThumbnailImageUploaded = () => {
        //check that we are completely done
        let allBlogImagesAndThumbsSuccess = true;
        this.state.blogImagesThumbnailStatusArr.forEach(function (nextStatus) {
            if (nextStatus !== STATUS_SUCCESS) {
                allBlogImagesAndThumbsSuccess = false;
            }
        });

        this.state.blogImagesStatusArr.forEach(function (nextStatus) {
            if (nextStatus !== STATUS_SUCCESS) {
                allBlogImagesAndThumbsSuccess = false;
            }
        });

        if (!allBlogImagesAndThumbsSuccess) {
            //if any raw image or its thumbnail has not succeeded do not continue with the uploading
            return;
        }
        console.log('setting titleimag network to loadin')

        //set title image to loading (this will trigger the updload of said title image)
        this.setState({
            titleImgNetworkStatus: STATUS_LOADING
        });

    };

    onTitleImageUploadComplete = (errData, titleImageData) => {
        if (errData) {
            console.log("error uploading title image ", errData.filename, " with error ", errData.error);
            this.setState({
                titleImgNetworkStatus: STATUS_FAILURE,
                networkStatusErrorMesage: errData.error.message
            });
            return;
        }

        //success
        this.setState({
            titleImgNetworkStatus: STATUS_SUCCESS,
            titleImageUrl: titleImageData.url
        }, () => {
            this.uploadBlog_blogData((errMsg) => {
                if (errMsg) {
                    this.setState({
                        networkStatusErrorMesage: errMsg
                    });
                    return;
                }
                //We dun fam (:
                //NOTE: blog upload data method in charge of statuses of blog upload
            });
        });
    };

    uploadBlog_blogData = (callback) => {
        this.setState({
            blogStatus: STATUS_LOADING
        }, () => {
            let blogDate = this.state.date;
            if (moment(blogDate.valueOf()).unix() === moment(moment().startOf('day').valueOf()).unix()) {
                // if they chose today, just use the time exactly right now (we assume we are not creating a blog from earlier today)
                blogDate = moment();
            }
            blogDate = moment(blogDate.valueOf()).unix();
            if (moment(this.state.date.valueOf()).unix() !== moment(moment().startOf('day').valueOf()).unix() && this.state.timeOfDaySelected) {
                // if they chose anything BUT today, add on the time selected option
                blogDate = blogDate + this.state.timeOfDaySelected.hour * secondsPerHour;
            }
            //send request with new blog entry
            let blogdata = {
                date: blogDate,
                country: this.state.country,
                location: this.state.location,
                state: this.state.state,
                title: this.state.title,
                titleImageUrl: this.state.titleImageUrl,
                tripId: this.state.tripId,
                blogContent: this.state.blogtext,
                blogImages: this.state.blogImagesUrls
            }

            uploadBlog(blogdata, (err, data) => {
                //upload blog call complete
                let status = null;
                if (err) {
                    this.setState({ blogStatus: STATUS_FAILURE });
                    console.log("Error in blog upload: ", err);
                    callback("Error whilst uploading blog info. See console for returned error");
                    return;
                }

                //You freakin did it man.
                // clear this stuff out and lets go home
                let refreshProp = !this.state.formRefreshProp;
                this.setState({
                    blogStatus: STATUS_SUCCESS,
                    title: '',
                    location: '',
                    titleImage: {},
                    titleImageUrl: null,
                    blogtext: [],
                    blogImages: {
                        imgFiles: []
                    },
                    formRefreshProp: refreshProp
                });
                callback();
            });
        });
    }

    storeBlogTextFromChildForm = (blogTextData) => {
        this.setState({ blogtext: blogTextData });
    }

    //returns true if the blog is ready to be submitted to the server
    isFormSubmitAllowed() {
        //form should not submit if we are currently uploading anything
        if (this.state.blogStatus === STATUS_LOADING || this.state.titleImgNetworkStatus === STATUS_LOADING || this.state.blogImagesStatusArr.includes(STATUS_LOADING)) {
            return false;
        }
        if (
            validateFormString(this.state.country) === FORM_SUCCESS &&
            validateDate(moment(this.state.date.valueOf()).unix()) === FORM_SUCCESS &&
            validateFormString(this.state.location) === FORM_SUCCESS &&
            validateFormString(this.state.state) === FORM_SUCCESS &&
            validateFormString(this.state.title) === FORM_SUCCESS &&
            validateFormString(this.state.tripId) === FORM_SUCCESS &&
            this.state.titleImage && validateFormString(this.state.titleImage.name) === FORM_SUCCESS &&
            this.state.blogtext && this.state.blogtext.length > 0
        ) {
            return true;
        }
        return false;
    }

    isFormEditAllowed = () => {
        if (this.state.blogStatus !== STATUS_LOADING && this.state.titleImgNetworkStatus !== STATUS_LOADING && !this.state.blogImagesStatusArr.includes(STATUS_LOADING) && !this.state.blogImagesThumbnailStatusArr.includes(STATUS_LOADING)) {
            return true;
        }
        return false;
    }

    storeCarouselImages = (imgData) => {
        this.setState({ blogImages: imgData });
    }

    storeTitleImage = (imgData) => {
        console.log('writeblog image selected');
        this.setState({ titleImage: imgData });
    }

    renderBlogUploadStatusMessage = () => {
        if (this.state.blogImagesStatusArr.includes(STATUS_FAILURE) || this.state.titleImgNetworkStatus === STATUS_FAILURE || this.state.blogStatus === STATUS_FAILURE) {
            return (
                <div>Error Message: "{this.state.networkStatusErrorMesage}"</div>
            )
        }

        if (this.state.blogImagesStatusArr.includes(STATUS_LOADING)) {
            let blogPhotosInProgressCount = 0;
            let blogPhotosSuccessCount = 0;
            this.state.blogImagesStatusArr.forEach((nextStatus) => {
                if (nextStatus === STATUS_LOADING) {
                    blogPhotosInProgressCount++;
                }
                if (nextStatus === STATUS_SUCCESS) {
                    blogPhotosSuccessCount++;
                }
            });

            if (blogPhotosInProgressCount > 0) {
                return (
                    <div>Uploaded {blogPhotosSuccessCount} of {this.state.blogImagesStatusArr.length}</div>
                );
            }
        }
        if (this.state.titleImgNetworkStatus === STATUS_LOADING) {
            return (
                <div>Uploading Title Photo</div>
            );
        }
        if (this.state.blogStatus === STATUS_LOADING) {
            return (
                <div>Uploading Blog Data</div>
            );
        }
        return null;
    }

    onTripSelected = (tripInfoReturned) => {
        //if location is empty default to the trips location
        let state = this.state.state;
        let country = this.state.country;

        if (!state || state === '') {
            state = tripInfoReturned.state;
        }
        if (!country || country === '') {
            country = tripInfoReturned.country;
        }

        this.setState({
            trip: tripInfoReturned.name,
            tripId: tripInfoReturned.id,
            state: state,
            country: country
        });
    };

    renderTimeOfDayOptions = (nextTime, index) => {
        return (
            <MenuItem
                key={`${index}-${nextTime.name}`}
                eventKey={index}
                onSelect={() => {
                    this.setState({
                        timeOfDaySelected: nextTime
                    });
                }}
            >
                {nextTime.name}
            </MenuItem>
        );
    };

    handleUserLeavingBlogForm = (ev) => {
        ev.preventDefault();
        return ev.returnValue = 'Are you sure you want to close?';
    };

    render() {
        let timeOfDayDropdown = null;
        //on any day except today, give the user a dropdown to choose a time of day 
        if (moment(this.state.date.valueOf()).unix() !== moment(moment().startOf('day').valueOf()).unix()) {
            let timeOfDaySelected = "Selected Time of Day";
            if (this.state.timeOfDaySelected) {
                timeOfDaySelected = this.state.timeOfDaySelected.name;
            }
            timeOfDayDropdown = (
                <DropdownButton
                    title={timeOfDaySelected}
                    disabled={!this.isFormEditAllowed()}
                >
                    {timeOfDayArr.map(this.renderTimeOfDayOptions)}
                </DropdownButton>
            );
        }

        if (this.state.blogtext.length > 0 || this.state.title.length > 0) {
            window.addEventListener("beforeunload", this.handleUserLeavingBlogForm);
        }
        else {
            window.removeEventListener('beforeunload', this.handleUserLeavingBlogForm);
        }

        return (
            <div className="WriteBlog">

                {/* minimum information required for blog (trip, title, date, location) */}
                <div className="form-group">
                    <DatePicker
                        selected={this.state.date}
                        onChange={this.handleDateChange}
                        className="form-control"
                        disabled={!this.isFormEditAllowed()}
                    />
                    {timeOfDayDropdown}
                </div>
                <form>

                    <div className="tripSelectFormSection">
                        <TripsDropdown
                            sortAlphabetically={false}
                            onTripReturned={this.onTripSelected} />
                    </div>
                    <FormGroup
                        controlId="tripFormInput"
                        validationState={validateFormString(this.state.trip)}
                    >
                        <ControlLabel>Trip</ControlLabel>
                        <FormControl.Feedback />
                        <div>
                            {this.state.trip}
                        </div>
                    </FormGroup>

                    <FormGroup
                        controlId="countryFormInput"
                        validationState={validateFormString(this.state.country)}
                    >
                        <ControlLabel>Country</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.country}
                            placeholder="Enter an Earth Country (Other worlds not yet supported)"
                            onChange={this.handleCountryChange}
                            disabled={!this.isFormEditAllowed()}
                        />
                        <FormControl.Feedback />
                    </FormGroup>

                    <FormGroup
                        controlId="stateFormInput"
                        validationState={validateFormString(this.state.state)}
                    >
                        <ControlLabel>State/Region</ControlLabel>
                        <FormControl
                            type="text"
                            value={this.state.state}
                            placeholder="Enter a State/Region Name"
                            onChange={this.handleStateChange}
                            disabled={!this.isFormEditAllowed()}
                        />
                        <FormControl.Feedback />
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
                            disabled={!this.isFormEditAllowed()}
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
                            disabled={!this.isFormEditAllowed()}
                        />
                        <FormControl.Feedback />
                    </FormGroup>

                    <TitleImageForm
                        refreshProp={this.state.formRefreshProp}
                        imageSelectedCallback={(imgData) => {
                            //NOTE to implementing components: 
                            //formDataCallback can/should be called with data parameter as null if form data is invalid
                            this.storeTitleImage(imgData)
                        }}
                    />

                </form>

                {/*form where you can dynamically create blog content (paragraphs, bullet list, etc.) */}
                <BlogEntryFormGenerator
                    refreshProp={this.state.formRefreshProp}
                    getBlogTextData={(data) => { this.storeBlogTextFromChildForm(data) }}
                />

                <ImageCarousel
                    refreshProp={this.state.formRefreshProp}
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
                        {(this.state.blogStatus === STATUS_LOADING || this.state.titleImgNetworkStatus === STATUS_LOADING || this.state.blogImagesStatusArr.includes(STATUS_LOADING))
                            && <CircularProgress />}
                        {(this.state.blogStatus === STATUS_SUCCESS && this.state.titleImgNetworkStatus === STATUS_SUCCESS && !this.state.blogImagesStatusArr.includes(STATUS_FAILURE) && !this.state.blogImagesStatusArr.includes(STATUS_LOADING))
                            && <Indicator success={true} />}
                        {(this.state.blogStatus === STATUS_FAILURE || this.state.titleImgNetworkStatus === STATUS_FAILURE || this.state.blogImagesStatusArr.includes(STATUS_FAILURE))
                            && <Indicator success={false} />}
                        {this.renderBlogUploadStatusMessage()}
                    </div>
                    {this.state.blogImages.imgFiles && this.state.blogImagesThumbnailStatusArr.includes(STATUS_LOADING) &&
                        <ResizeImg filesToThumbAndUpload={this.state.blogImages.imgFiles}
                            tripId={this.state.tripId}
                            onPhotoFinished={this.onThumbnailUploadComplete}
                        />
                    }
                    {this.state.titleImage && this.state.titleImgNetworkStatus === STATUS_LOADING &&
                        <SingleImageUpload imageFileToUpload={this.state.titleImage}
                            tripId={this.state.tripId}
                            onPhotoFinished={this.onTitleImageUploadComplete}
                        />
                    }
                </ButtonToolbar>
            </div>
        );
    }
}

export default WriteBlog;