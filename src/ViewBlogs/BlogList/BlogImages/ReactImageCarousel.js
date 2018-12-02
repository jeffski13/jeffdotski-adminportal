import React from 'react';
import PropTypes from 'prop-types';
import ImageGallery from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css";

class ReactImageCarousel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentImageIndex: 0
        }
    }
    
    render() {
        const images = this.props.images;
        const imageUrls = [];

        images.map((nextImageItem)=>{
            imageUrls.push({
                original: nextImageItem.url,
                thumbnail: nextImageItem.thumbnailUrl,
                originalTitle: nextImageItem.imageTitle,
                thumbnailTitle: nextImageItem.imageTitle
            });
        })
        return (
            <div>
                <div>{this.props.images[this.state.currentImageIndex].imageTitle}</div>
                <div>{this.props.images[this.state.currentImageIndex].imageDescription}</div>
                <ImageGallery 
                    thumbnailPosition="bottom" 
                    items={imageUrls} 
                    onSlide={(index) => {
                        console.log('jeffski on image gallery change: ', index);
                        this.setState({
                            currentImageIndex: index
                        });
                    }} 
                />
            </div>
        );
    }
}

ReactImageCarousel.propTypes = {
    images: PropTypes.array.isRequired
    // array of image data:
    // {
    //   rawUrl: string
    //   thumbUrl: string
    // }
}

export default ReactImageCarousel;