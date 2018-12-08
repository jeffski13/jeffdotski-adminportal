import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import Indicator from '../../aws/Indicator';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../../aws/networkConsts';
import {uploadPhoto} from '../../aws/photo';

export default class SingleImageUpload extends React.Component {

    static propTypes = {
        imageFileToUpload: PropTypes.object.isRequired,
        tripId: PropTypes.string.isRequired,
        onPhotoFinished: PropTypes.func
    };

    //default to empty functions to avoid crash
    static defaultProps = {
        // imageData = {
        //   filename: string, 
        //   url: string
        // }
        // err = {
        //   error: object 
        //   filename: string
        // }
        onPhotoFinished: (err, imageData) => { }
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            imageUrl: null,
            imageNetworkStatus: null, //status for both blog photos and title photo
            networkStatusErrorMesage: '',
            error: null
        };
    }

    componentDidMount() {
        console.log('SingleImageUoload calling uploadimage');
        this.uploadImage();
    }
    
    uploadImage = () => {
        
        let file = this.props.imageFileToUpload;
        if (!file) {
            // fail here as they didnt give the image we needed.
            // The console will warn them of their treachery
            return false;
        }
        
        this.setState({
            imageUrl: null,
            imageNetworkStatus: STATUS_LOADING
        });
        
        console.log('SingleImageUoload calling uploadphoto for aws with ');
        //upload photo first, then include photo location when uploading blog 
        uploadPhoto(this.props.imageFileToUpload, this.props.tripId, (err, uploadedImageData) => {
            console.log('aws returned info');
            if (err) {
                console.log('aws returned info: err');
                // Failure (in the original super smash narrator voice)
                console.log("Error in title image upload: ", err);
                this.props.onPhotoFinished({
                    error: err,
                    filename: file.name
                });
                this.setState({
                    imageNetworkStatus: STATUS_FAILURE
                });
                return;
            }
            console.log('aws returned info: success');

            // WE DID IT! uploaded title photo (:
            this.props.onPhotoFinished(null, {
                filename: file.name,
                url: uploadedImageData.Location
            });

        });
    }

    render() {
        let uploadProgress = null;
        if (this.state.imageNetworkStatus === STATUS_LOADING) {
            uploadProgress = (
                <span>
                    Working On It: ({this.props.imageFileToUpload.name})
                </span>
            );
        }
        return (
            <div>
                <span>
                    {(this.state.imageNetworkStatus === STATUS_LOADING)
                        && <CircularProgress />}
                    {(this.state.imageNetworkStatus === STATUS_SUCCESS)
                        && <Indicator success={true} />}
                    {(this.state.imageNetworkStatus === STATUS_FAILURE)
                        && <Indicator success={false} />}
                    {uploadProgress}
                </span>
            </div>
        );
    }
}