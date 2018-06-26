import React from 'react';
import PropTypes from 'prop-types';

import { Image } from 'react-bootstrap';
import BlogImageItem from './BlogImageItem';
import './styles.css';

import Carousel from 'react-image-carousel';

class BlogImages extends React.Component {

    constructor() {
        super();
        this.state = {
            width: window.innerWidth,
        };
    }

    componentWillMount() {
        window.addEventListener('resize', this.handleWindowSizeChange);
    }

    // make sure to remove the listener
    // when the component is not mounted anymore
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () => {
        this.setState({ width: window.innerWidth });
    };

    renderBlogImageItems = (blogImageItemData, index) => {
        console.log('jeffski rendering blog images Item: ', blogImageItemData);

        return (
            <BlogImageItem
                key={blogImageItemData.url + index}
                title={blogImageItemData.imageTitle}
                description={blogImageItemData.imageDescription}
                imageUrl={blogImageItemData.url}
            />
        );
    }

    renderSmallScreenImages(imageUrl) {
        return (<Image src={imageUrl} responsive />);
    }

    render() {

        //make sure blog images exist
        if (!this.props.blogImageData) {
            return null;
        }

        let images = [];
        this.props.blogImageData.forEach(element => {
            images.push(element.url);
        });

        const { width } = this.state;
        const isMobile = width <= 650;

        if (isMobile) {
            console.log(images);
            return (
                <div className="BlogImages__ResponsiveImages">
                    {images.map(this.renderSmallScreenImages)}
                </div>
            );
        }
        else {
            return (
                <div className="BlogImages__Carousel">
                    <Carousel
                        images={images}
                        thumb={true}
                        loop={false}
                        autoplay={20000} />
                </div>
            );
        }

    }
}

BlogImages.propTypes = {
    blogImageData: PropTypes.array
}

export default BlogImages;