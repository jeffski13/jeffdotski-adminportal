import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import BlogImageItem from './BlogImageItem';
import './styles.css';
import './react-image-carousel.css';
import ReactImageCarousel from './ReactImageCarousel';

class BlogImages extends React.Component {

    constructor() {
        super();
        this.state = {
            width: window.innerWidth,
            isImageFullScreen: false,
            imageFullScreenUrl: ''
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

    onImageFullScreenClose = () => {
        this.setState({ isImageFullScreen: false });
    };

    showImageFullScreen = (imageUrl) => {
        this.setState({ 
            isImageFullScreen: true,
            imageFullScreenUrl: imageUrl
        });
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

    renderDesktopGallery = (nextImageItem) => {
        return (
            <div className="img-container-background">
                <div className="img-container">
                    <img
                        src={nextImageItem.url}
                        className="img-responsive img-clickable"
                        onClick={()=>{
                            this.showImageFullScreen(nextImageItem.url)
                        }}
                    />
                </div>
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

        //is it time to go mobile?
        let isMobile = false;
        if (this.state.width <= 650) {
            isMobile = true;
        }

        images = [
            {
                url: "http://i.imgur.com/37w80TG.jpg",
                imageTitle: "title",
                imageDescription: "descski"
            },
            {
                url: "http://i.imgur.com/tI5jq2c.jpg",
                imageTitle: "title",
                imageDescription: "descski"
            },
            {
                url: "http://i.imgur.com/B1MCOtx.jpg",
                imageTitle: "title",
                imageDescription: "descski"
            },
            {
                url: "http://i.imgur.com/37w80TG.jpg",
                imageTitle: "title",
                imageDescription: "descski"
            }
        ]

        if (isMobile) {
            console.log('jeffski rendering mobile images');
            return (
                <div className="BlogImages__ResponsiveImages">
                    {images.map(this.renderSmallScreenImages)}
                </div>
            );
        }
        else if(false) { //not at all mobile
            return (
                <React.Fragment>
                    <div className="clearfloatfix"></div>
                    <div className="blogimages-row-container" >
                        {images.map(this.renderDesktopGallery)}
                    </div>

                    <Modal show={this.state.isImageFullScreen} onHide={this.onImageFullScreenClose}>
                        <span className="blogimage-full-screen-helper-css-span" />
                        <img src={this.state.imageFullScreenUrl} class="img-responsive center-block blogimage-full-screen" />
                    </Modal>
                </React.Fragment>
            );
        }
        else {
            return(
                <React.Fragment>

                    <div className="spacer-carousel">
                    </div>
                    <ReactImageCarousel images={images} />
                </React.Fragment>
            )
        }

    }
}

BlogImages.propTypes = {
    blogImageData: PropTypes.array
}

export default BlogImages;