import React from 'react';
import PropTypes from 'prop-types';
import {Carousel} from 'react-bootstrap';

class BlogImageItem extends React.Component {
    render(){
        return(
            <Carousel.Item>
                <img width={900} height={500} alt="900x500" src={this.props.imageUrl} />
                <Carousel.Caption>
                    {this.props.title 
                        ? <h3>{this.props.title}</h3>
                        : null }
                    {this.props.description
                        ? <p>{this.props.description}</p>
                        : null }
                </Carousel.Caption>
            </Carousel.Item>
        );
    }
}

BlogImageItem.propTypes = {
    description: PropTypes.string,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string
}

export default BlogImageItem;