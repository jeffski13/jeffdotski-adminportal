import React from 'react';
import PropTypes from 'prop-types';
import ImageGallery from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css";

class ReactImageCarousel extends React.Component {
    render() {
        const images = this.props.images;
        const imageUrls = [];

        images.map((nextImageItem)=>{
            imageUrls.push({
                original: nextImageItem.rawUrl,
                thumbnail: nextImageItem.thumbUrl
            });
        })
        return (
            <div>
                React Image Carousel
                <ImageGallery items={imageUrls} />
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