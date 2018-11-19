import React from 'react';
import PropTypes from 'prop-types';

import ReactImageCarousel from './ReactImageCarousel';
import {Image} from 'react-bootstrap';

import "./blog-image-styles.css";

class BlogImages extends React.Component {
    
    static propTypes = {
        //all of the image data for the blog
        blogImageData: PropTypes.array.isRequired,
    };

    constructor() {
        super();
        this.state = {
            width: window.innerWidth
        };
    }

    // add a listener for the screen size since we have a mobile view
    componentWillMount() {
        window.addEventListener('resize', this.handleWindowSizeChange);
    }

    // make sure to remove the listener for the screen size
    // when the component is not mounted anymore
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleWindowSizeChange = () => {
        this.setState({ width: window.innerWidth });
    };

    renderBlogImageItems = (blogImageItemData, index) => {
        console.log('jeffski rendering mobile blog images Item: ', blogImageItemData);

        return (
            <div className="BlogImages-mobile-responsive-images" >
                <Image
                    key={blogImageItemData.url + index}
                    src={blogImageItemData.url}
                    responsive 
                    />
                <p>{blogImageItemData.imageTitle}</p>
                <p>{blogImageItemData.imageDescription}</p>
            </div>
        );
    }
    
    render() {

        //make sure blog images exist. If not, dont render a darn thing
        if (!this.props.blogImageData || this.props.blogImageData.length === 0) {
            console.log('jeffski rendering blogimage: no images > Null');
            return null;
        }

        let images = [];
        this.props.blogImageData.forEach(nextBlogImageData => {
            images.push(nextBlogImageData.url);
        });

        console.log('jeffski images', images);
        //is it time to go mobile?
        let isMobile = false;
        if (this.state.width <= 650) {
            isMobile = true;
        }

        // images = [
        //     {
        //         url: "http://i.imgur.com/37w80TG.jpg",
        //         imageTitle: "title",
        //         imageDescription: "descski"
        //     },
        //     {
        //         url: "http://i.imgur.com/tI5jq2c.jpg",
        //         imageTitle: "title",
        //         imageDescription: "descski"
        //     },
        //     {
        //         url: "http://i.imgur.com/B1MCOtx.jpg",
        //         imageTitle: "title",
        //         imageDescription: "descski"
        //     },
        //     {
        //         url: "http://i.imgur.com/37w80TG.jpg",
        //         imageTitle: "title",
        //         imageDescription: "descski"
        //     }
        // ]

        if (isMobile) {
            console.log('jeffski rendering mobile images');
            return (
                <React.Fragment>
                    <div className="BlogImages-top-spacer" />
                    <div >
                        {images.map(this.renderBlogImageItems)}
                    </div>
                </React.Fragment>
            );
        }
        else { //not at all mobile
            return (
                <React.Fragment>
                    <div className="BlogImages-top-spacer" />
                    <ReactImageCarousel images={images} />
                </React.Fragment>
            );
        }

    }
}

export default BlogImages;