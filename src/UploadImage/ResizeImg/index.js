import React from 'react';
import PropTypes from 'prop-types';
import { uploadPhotoThumbnail } from '../../aws/thumbnail';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import Indicator from '../../aws/Indicator';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../../aws/networkConsts';

export default class ResizeImg extends React.Component {

    static propTypes = {
        filesToResizeAndUpload: PropTypes.array.isRequired,
        tripId: PropTypes.string.isRequired,
        resizeHeight: PropTypes.number, //the height
        subfolderName: PropTypes.string,
        onPhotoFinished: PropTypes.func
    };

    //default to empty functions to avoid crash
    static defaultProps = {
        // the onPhotoFinished() resizedImageData param will be an array with these objects:
        // {
        //   filename: string, 
        //   url: string, 
        //   index: number
        // }
        onPhotoFinished: (err, resizedImageData) => { },
        resizeHeight: 250,
        subfolderName: 'default'
    };

    constructor(props) {
        super(props);

        this.state = {
            thumbnailUrls: [
                {
                    filename: '',
                    url: ''
                }
            ],
            picsToUpload: -1,
            picsSuccessful: -1,
            picsFailed: -1,
            loading: false,
            thumbnailNetworkStatus: null
        }
    }

    componentDidMount() {
        this.createThumnailAndUpload();
    }
    
    shouldComponentUpdate(nextProps, nextState){
        if(this.props.filesToResizeAndUpload !== nextProps.filesToResizeAndUpload){
            this.createThumnailAndUpload();
        }
    }

    createThumnailAndUpload = () => {

        let files = this.props.filesToResizeAndUpload;
        if (files == null || files == undefined || files.length === 0) {
            // fail here as they didnt give files we needed.
            // The console will warn them of their treachery
            return false;
        }
        
        this.setState({
            thumbnailUrls: [],
            picsToUpload: files.length,
            picsSuccessful: 0,
            picsFailed: 0,
            thumbnailNetworkStatus: STATUS_LOADING
        });

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileIndex = i;
            let imageType = /image.*/;
            if (!file.type.match(imageType)) {
                continue;
            }
            
            let reader = new FileReader();
            if (reader != null) {
                reader.onload = (event) => {
                    let resizeHeight = this.props.resizeHeight;
                    let subfolderName = this.props.subfolderName;

                    let resizedCanvas = document.createElement('canvas');
                    let img = new Image();
                    img.src = event.target.result;
                    // need reference to parentreactComponent because we cant bind this (need this of the img.onload to get height and width)
                    let tripId = this.props.tripId;
                    let parentReactComponent = this;
                    img.onload = function () {
            
                        resizedCanvas.id = "myTempCanvas";
                        let ratioedWidth = Math.floor((this.width * resizeHeight) / this.height);
                        resizedCanvas.width = Number(ratioedWidth);
                        resizedCanvas.height = Number(resizeHeight);
            
                        if (resizedCanvas.getContext) {
                            let cntxt = resizedCanvas.getContext("2d");
                            cntxt.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);
                            let dataURL = resizedCanvas.toDataURL();
                            let resizedImgToUpload = {
                                name: "filenameski",
                                src: dataURL
                            }
            
                            resizedCanvas.toBlob((createdBlog) => {
                                //upload the file
                                uploadPhotoThumbnail(createdBlog, subfolderName, tripId, (err, data) => {
                                    //error handling
                                    if (err) {
                                        parentReactComponent.props.onPhotoFinished({
                                            error: err,
                                            filename: file.name,
                                            index: fileIndex
                                        });
                                        parentReactComponent.setState({
                                            picsFailed: parentReactComponent.state.picsFailed + 1,
                                            thumbnailNetworkStatus: STATUS_FAILURE
                                        });
                                        return;
                                    }
                                    //success: set status to success if we are done and all is well 
                                    let networkstatus = STATUS_LOADING;
                                    if (parentReactComponent.state.picsFailed + parentReactComponent.state.picsSuccessful + 1 === parentReactComponent.state.picsToUpload) {
                                        if(parentReactComponent.state.picsFailed === 0){
                                            networkstatus = STATUS_SUCCESS;
                                        }
                                        else {
                                            //something must have failed. bummer
                                            networkstatus = STATUS_FAILURE;
                                        }
                                    }
                                    parentReactComponent.props.onPhotoFinished(null, {
                                        filename: file.name,
                                        index: fileIndex,
                                        url: data.Location
                                    });
                                    parentReactComponent.setState({
                                        thumbnailUrls: [...parentReactComponent.state.thumbnailUrls,{
                                            filename: file.name,
                                            url: data.Location
                                        }],
                                        picsSuccessful: parentReactComponent.state.picsSuccessful + 1,
                                        thumbnailNetworkStatus: networkstatus
                                    });
                                });
                            });
            
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    } 

    render() {
        let uploadProgress = null;
        if (this.state.picsToUpload > 0) {
            let picsFailedReadout = null;
            if (this.state.picsFailed > 0) {
                picsFailedReadout = (
                    <span> Failed: {this.state.picsFailed}</span>
                );
            }
            uploadProgress = (
                <span>
                    Uploading {this.props.subfolderName} photos: ({this.state.picsSuccessful} of {this.state.picsToUpload})
                    {picsFailedReadout}
                </span>
            );
        }

        return (
            <div>
                <span>
                    {(this.state.thumbnailNetworkStatus === STATUS_LOADING)
                        && <CircularProgress />}
                    {(this.state.thumbnailNetworkStatus === STATUS_SUCCESS)
                        && <Indicator success={true} />}
                    {(this.state.thumbnailNetworkStatus === STATUS_FAILURE)
                        && <Indicator success={false} />}
                    {uploadProgress}
                </span>
            </div>
        );
    }
}