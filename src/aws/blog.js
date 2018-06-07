import {AWS_API_KEY_AWS_ACCESS, AWS_API_KEY_READONLY} from '../configski';
import axios from 'axios';

/**
 * uploads a specified blog to aws
 * 
 * @param {object} blogData - data for the blog being uploaded
 * @param {function} callback - (err, data) - function which will return error or data from aws
 */
export function uploadBlog(blogData, callback){
    axios({
        method: 'post',
        url: `https://ctbw9plo6d.execute-api.us-east-2.amazonaws.com/Prod/blogs_read`,
        headers: { 'x-api-key': AWS_API_KEY_AWS_ACCESS },
        data: blogData
    })
    .then((response) => {
        callback(null, response);
    })
    .catch((error) => {
        callback(error);
    });
}

/**
 * gets all blogs for a given trip
 * 
 * @param {string} tripName - the name of the trip for which you want the blogs
 * @param {function} callback - (err, data) - function which will return the blogs or an error from aws
 */
export function getBlogs(tripName, callback){
    axios({
        method: 'get',
        url: `https://864wf8s3oi.execute-api.us-east-2.amazonaws.com/Prod/blogs_read?tripName=${tripName}`,
        headers: { 'x-api-key': AWS_API_KEY_READONLY }
    })
    .then((response) => {
        //parse the response
        let rawBlogResponseArr = response.data;

        callback(null, rawBlogResponseArr);
    })
    .catch(function (error) {
        callback(error);
    });
}