import React from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';
import { uploadPhotoThumbnail } from '../../aws/thumbnail';
import CircularProgress from 'material-ui/Progress/CircularProgress';

import Indicator from '../../aws/Indicator';
import { STATUS_LOADING, STATUS_FAILURE, STATUS_SUCCESS } from '../../aws/networkConsts';

export default class ExampleResizeImg extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            s3paths: [],
            picsToUpload: -1,
            picsSuccessful: -1,
            picsFailed: -1,
            loading: false,
            thumbnailNetworkStatus: null
        }
    }

    onImagesChosen = (event) => {

        let files = event.target.files;
        if (files == null || files == undefined) {
            document.write("This Browser has no support for HTML5 FileReader yet!");
            return false;
        }

        this.setState({
            s3paths: [],
            picsToUpload: files.length,
            picsSuccessful: 0,
            picsFailed: 0,
            thumbnailNetworkStatus: STATUS_LOADING
        });

        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            let imageType = /image.*/;
            if (!file.type.match(imageType)) {
                continue;
            }

            let reader = new FileReader();
            if (reader != null) {
                reader.onload = this.GetThumbnail;
                reader.readAsDataURL(file);
            }
        }
    }

    GetThumbnail = (event) => {
        var resizedCanvas = document.createElement('canvas');
        var img = new Image();
        img.src = event.target.result;
        var parentReactComponent = this;
        img.onload = function () {

            resizedCanvas.id = "myTempCanvas";
            var fixHeight = 250;
            var ratioedWidth = Math.floor((this.width * fixHeight) / this.height);
            resizedCanvas.width = Number(ratioedWidth);
            resizedCanvas.height = Number(fixHeight);

            if (resizedCanvas.getContext) {
                var cntxt = resizedCanvas.getContext("2d");
                cntxt.drawImage(img, 0, 0, resizedCanvas.width, resizedCanvas.height);
                var dataURL = resizedCanvas.toDataURL();
                var resizedImgToUpload = {
                    name: "filenameski",
                    src: dataURL
                }

                resizedCanvas.toBlob((createdBlog) => {
                    //upload the file
                    uploadPhotoThumbnail(createdBlog, 'Jeffski2025thumb', (err, data) => {
                        //error handling
                        if (err) {
                            parentReactComponent.setState({
                                picsFailed: parentReactComponent.state.picsFailed + 1,
                                thumbnailNetworkStatus: STATUS_FAILURE
                            });
                            return;
                        }
                        //success: set status to success if we are done and all is well 
                        let networkstatus = STATUS_LOADING;
                        if (parentReactComponent.state.picsFailed + parentReactComponent.state.picsSuccessful + 1 === parentReactComponent.state.picsToUpload && parentReactComponent.state.picsFailed === 0) {
                            networkstatus = STATUS_SUCCESS;
                        }
                        parentReactComponent.setState({
                            s3paths: [...parentReactComponent.state.s3paths, data.Location],
                            picsSuccessful: parentReactComponent.state.picsSuccessful + 1,
                            thumbnailNetworkStatus: networkstatus
                        });
                    });

                    //draw it on screen
                    if (dataURL != null && dataURL != undefined) {
                        var nImg = document.createElement('img');
                        nImg.src = dataURL;
                        document.body.appendChild(nImg);
                    }
                    else {
                        alert('unable to get context');
                    }
                })

            }
        }
    }

    renderThumbnailUrls(thumbnailUrl, index) {
        return (
            <div>
                <a href={thumbnailUrl}>Link to photo {index}</a>
            </div>
        );
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
                    Working On It: ({this.state.picsSuccessful} of {this.state.picsToUpload})
                    {picsFailedReadout}
                </span>
            );
        }

        return (
            <div>
                RESIZE IMAGE:
                <FormGroup controlId="imageSelectski" >
                    <FormControl
                        multiple
                        type="file"
                        placeholder="Choose File"
                        onChange={this.onImagesChosen}
                        accept='image/*'
                        />
                </FormGroup>
                <span>
                    {(this.state.thumbnailNetworkStatus === STATUS_LOADING)
                        && <CircularProgress />}
                    {(this.state.thumbnailNetworkStatus === STATUS_SUCCESS)
                        && <Indicator success={true} />}
                    {(this.state.thumbnailNetworkStatus === STATUS_FAILURE)
                        && <Indicator success={false} />}
                    {uploadProgress}
                </span>
                {this.state.s3paths.map(this.renderThumbnailUrls)}
            </div>
        );
    }
}