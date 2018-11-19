import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import BlogImages from './BlogImages';
import BlogTextItem from './BlogTextItem';
import './styles.css';

export default class BlogList extends React.Component {

    static propTypes = {
        //all of the data for the blogs (images, text, etc.)
        blogsArr: PropTypes.array.isRequired,
    };

    renderBlogtextItem = (blogPostBody) => {
        return (
            <BlogTextItem
                blogTextData={blogPostBody}
            />
        );
    }

    //render each blog here
    // show Title, Location, Date, and 
    renderBlogItem = (blogItem, index) => {

        if (!blogItem) {
            return null;
        }

        return (
            <div className="blog" key={blogItem.date}>
                <div>Title: {blogItem.title}</div>
                <div>Location: {blogItem.location}</div>
                {blogItem.state && <div>State: {blogItem.state}</div>}
                {blogItem.state && <div>Country: {blogItem.country}</div>}
                <div>Date: {moment.unix(blogItem.date).format("MM/DD/YYYY")}</div>
                {blogItem.blogContent.map(this.renderBlogtextItem)}
                <img src={blogItem.titleImageUrl} height="300px" />
                <BlogImages blogImageData={blogItem.blogImages} />
            </div>
        );
    }

    sortBlogsByDate = (a,b) => {
        if (a.date < b.date){
            return 1;
        }
        if (a.date > b.date){
            return -1;
        }
        return 0;
    }

    render(){
        //order blogs by date
        let blogsArr = [...this.props.blogsArr];
        if(!blogsArr){
            return null;
        }

        blogsArr.sort(this.sortBlogsByDate);
        return (
            <div className="BlogList">
                {blogsArr.map(this.renderBlogItem)}
            </div>
        );
    }
}