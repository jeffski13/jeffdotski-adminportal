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
                original: nextImageItem,
                thumbnail: nextImageItem
            });
        })
        console.log('jeffski in ReactImageCarousel: ', imageUrls);
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
}

export default ReactImageCarousel;