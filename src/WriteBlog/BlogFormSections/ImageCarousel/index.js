import React from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';
import './styles.css';
class ImageCarousel extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            selectedImageFiles: [],
            imgPreviewUrls: []
        };
    }

    handleImgFilesChange = (e) => {
        let imgsArr = [];
        let i;
        for (i = 0; i < e.target.files.length; i++) {
            imgsArr.push(e.target.files[i]);
        }
        this.setState({ selectedImageFiles: imgsArr });
    }

    _handleImageChange(e) {
        e.preventDefault();

        //store all the file objects and an array of empties for the preview urls in state
        let imgsArr = [];
        let previewUrlArr = [];
        for (let i = 0; i < e.target.files.length; i++) {
            imgsArr.push(e.target.files[i]);
            previewUrlArr.push('');
        }
        console.log('files: ', imgsArr);
        this.setState({
            selectedImageFiles: imgsArr,
            imgPreviewUrls: previewUrlArr
        }, () => {
            //once preview url array with length is stored we can start storing preview urls as they come in
            for (let i = 0; i < this.state.selectedImageFiles.length; i++) {
                let reader = new FileReader();
                let file = this.state.selectedImageFiles[i];

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

    renderImagePreview = (fileUrl,index) => {

        if (fileUrl) {
            let name = this.state.selectedImageFiles[index].name;
            return (
                <div 
                    key={index + name} 
                    className="image-carousel__preview-image" 
                    >
                    <img 
                        src={fileUrl}
                        className="image-carousel__preview-image-individual" 
                     />
                    <div>{name}</div>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <div>
                <form>
                    <FormGroup
                        controlId="imageSelectski"
                    >
                        <FormControl
                            multiple
                            type="file"
                            placeholder="Choose File"
                            onChange={(e) => this._handleImageChange(e)} />
                    </FormGroup>
                </form>
                <div>Preview:</div>
                <div className="image-carousel__preview-images-section">
                    {this.state.imgPreviewUrls.map(this.renderImagePreview)}
                </div>
            </div>
        );
    }
}

export default ImageCarousel;