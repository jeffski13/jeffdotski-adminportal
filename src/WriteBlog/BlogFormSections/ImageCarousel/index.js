import React from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';

class ImageCarousel extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            selectedImageFiles: [],
            file: '',
            imagePreviewUrl: ''
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
        
        let reader = new FileReader();
        let file = e.target.files[0];

        //give the reader a callback so it stores the images to state when its done reading them in
        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result
            });
        }

        reader.readAsDataURL(file)
    }

    renderImagePreview(){
        if (this.state.imagePreviewUrl) {
            return (<img src={this.state.imagePreviewUrl} />);
        } else {
            return (<div className="previewText">Please select an Image for Preview</div>);
        }
        return null;
    }

    render() {
        console.log('jeffski files in: ', this.state.selectedImageFiles);


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
                            onChange={(e)=>this._handleImageChange(e)} />
                    </FormGroup>
                </form>
                <div>Preview:</div>
                <div className="imgPreview">
                    {this.renderImagePreview()}
                </div>
            </div>
        );
    }
}

export default ImageCarousel;