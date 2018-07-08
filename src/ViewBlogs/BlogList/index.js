import React from 'react';
import moment from 'moment';

import BlogImages from './BlogImages';
import BlogTextItem from './BlogTextItem';
import './styles.css';

class BlogList extends React.Component {

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
                <div>Date: {moment.unix(blogItem.date).format("MM/DD/YYYY")}</div>
                {blogItem.blogContent.map(this.renderBlogtextItem)}
                <img src={blogItem.titleImage} height="300px" />
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

export default BlogList;