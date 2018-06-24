import React from 'react';
import PropTypes from 'prop-types';
import {Carousel} from 'react-bootstrap';

import BlogImageItem from './BlogImageItem';
import Cookie from './cookie.jpg';

class BlogImages extends React.Component {
    
    renderBlogImageItems = (blogImageItemData, index) => {
        console.log('jeffski rendering blog images Item: ', blogImageItemData);

        return(
            <BlogImageItem
                key={blogImageItemData.url + index}
                title={blogImageItemData.imageTitle}
                description={blogImageItemData.imageDescription}
                imageUrl={blogImageItemData.url}
            />
        );
    }

    render(){
        //make sure blog images exist
        if(!this.props.blogImageData){
            return null;
        }

        console.log('jeffski rendering blog images: ', this.props.blogImageData);

        return (
            <div>
                BlogImages
                <Carousel>
                    <Carousel.Item>
                        <img width={900} height={500} alt="900x500" src={Cookie} />
                        <Carousel.Caption>
                        <h3>First slide label</h3>
                        <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    {this.props.blogImageData.map(this.renderBlogImageItems)}
                </Carousel>
            </div>
        );
    }
}

BlogImages.propTypes = {
    blogImageData: PropTypes.array
}

export default BlogImages;