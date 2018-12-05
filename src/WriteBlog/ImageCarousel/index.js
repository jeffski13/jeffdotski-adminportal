import React from 'react';
import { Panel, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import PropTypes from 'prop-types';

import './styles.css';
export default class ImageCarousel extends React.Component {

    static propTypes = {
        //callback image data
        imageSelectedCallback: PropTypes.func.isRequired,
        //refresh counter: could be anything just needs to change to refresh
        refreshProp: PropTypes.any
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            imgPreviewUrls: [],
            finalImageData: {
                imgFiles: [], //array contains the images
                imgMetaData: [] //sister array containing title, description, etc. for images
            }
        };
    }

    componentDidUpdate(prevProps) {
        //wipe out our data on refresh update
        if (this.props.refreshProp !== prevProps.refreshProp) {
            this.setState({
                imgPreviewUrls: [],
                finalImageData: {
                    imgFiles: [], //array contains the images
                    imgMetaData: [] //sister array containing title, description, etc. for images
                }
            });
        }
    }

    handleImgFilesChange = (e) => {
        let imgsArr = [];
        for (let i = 0; i < e.target.files.length; i++) {
            imgsArr.push(e.target.files[i]);
        }
        this.setState({ selectedImageFiles: imgsArr });
    }

    handleImageInputChange(e) {
        e.preventDefault();
        console.log('files: ', e.target.files);

        //length will be zero when user hits cancel
        if (e.target.files.length === 0) {
            return;
        }

        //store all the file objects and an array of empties for the preview urls in state
        let imgsArr = {
            imgFiles: [],
            imgMetaData: []
        };
        let previewUrlArr = [];
        for (let i = 0; i < e.target.files.length; i++) {
            imgsArr.imgFiles.push(e.target.files[i]);
            imgsArr.imgMetaData.push({
                imageTitle: undefined,
                imageDescription: undefined
            });
            previewUrlArr.push('');
        }

        this.setState({
            imgPreviewUrls: previewUrlArr,
            finalImageData: imgsArr
        }, () => {
            //first transfer what we have to parent
            this.transferImageDataToParent();

            //once preview url array with length is stored we can start storing preview urls as they come in
            for (let i = 0; i < this.state.finalImageData.imgFiles.length; i++) {
                let reader = new FileReader();
                let file = this.state.finalImageData.imgFiles[i];

                //give the reader a callback so it stores the images to state when its done reading them in
                reader.onloadend = () => {
                    let previewUrls = [...this.state.imgPreviewUrls];
                    //store the url in the matching state index
                    previewUrls[i] = reader.result;
                    this.setState({
                        imgPreviewUrls: previewUrls
                    });
                }

                reader.readAsDataURL(file)
            }
        });
    }

    transferImageDataToParent = () => {
        //hand data up to parent
        this.props.imageSelectedCallback(this.state.finalImageData);
    }

    //the image preview area which contains all of the images
    renderPreviewArea = () => {
        if (this.state.imgPreviewUrls.length > 0) {
            return (
                <div>
                    <div>Preview:</div>
                    <div className="image-carousel__preview-images-section">
                        {this.state.imgPreviewUrls.map(this.renderImagePreview)}
                    </div>
                </div>
            );
        }
        else {
            return null;
        }
    }

    //the individual image preview
    renderImagePreview = (fileUrl, index) => {
        if (fileUrl) {
            let name = this.state.finalImageData.imgFiles[index].name;
            return (
                <div
                    key={index + name}
                    className="image-carousel__preview-image"
                >
                    <img
                        src={fileUrl}
                        className="image-carousel__preview-image-individual"
                    />
                    <div className="image-carousel__preview-image-details" >
                        <div className="image-carousel__preview-image-file-name">
                            <strong>File Name:</strong> {name}
                        </div>
                        <FormGroup>
                            <label className="has-float-label">
                                <FormControl
                                    type="text"
                                    className="form-label-group ability-input"
                                    value={this.state.finalImageData.imgMetaData[index].imageTitle}
                                    placeholder="Where you was"
                                    onChange={(event) => {
                                        let imgDataArr = { ...this.state.finalImageData };
                                        imgDataArr.imgMetaData[index].imageTitle = event.target.value;
                                        this.setState({ finalImageData: imgDataArr });
                                    }}
                                    onBlur={this.transferImageDataToParent}
                                />
                                <span>Title</span>
                            </label>
                        </FormGroup>
                        <FormGroup>
                            <label className="has-float-label">
                                <FormControl
                                    type="text"
                                    className="form-label-group ability-input"
                                    value={this.state.finalImageData.imgMetaData[index].imageDescription}
                                    placeholder="What happened here?"
                                    onChange={(event) => {
                                        let imgDataArr = { ...this.state.finalImageData };
                                        imgDataArr.imgMetaData[index].imageDescription = event.target.value;
                                        this.setState({ finalImageData: imgDataArr });
                                    }}
                                    onBlur={this.transferImageDataToParent}
                                />
                                <span>Description</span>
                            </label>
                        </FormGroup>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <Panel>
                <Panel.Heading>
                    Blog Images
                </Panel.Heading>
                <Panel.Body>
                    <form>
                        <FormGroup
                            controlId="imageSelectski"
                        >
                            <FormControl
                                multiple
                                type="file"
                                placeholder="Choose File"
                                onChange={(e) => this.handleImageInputChange(e)} />
                        </FormGroup>
                    </form>
                    <form>
                        {this.renderPreviewArea()}
                    </form>
                </Panel.Body>
            </Panel>
        );
    }
}