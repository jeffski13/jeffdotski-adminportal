import {AWS_API_KEY_READONLY, AWS_API_KEY_AWS_ACCESS} from '../configski';
import axios from 'axios';

/**
 * gets all trips for all blogs ever
 * 
 * @param {function} callback - (err, data) - function which will return the trips or an error from aws
 */
export function getTrips(callback){
    axios({
        method: 'get',
        url: "https://ctbw9plo6d.execute-api.us-east-2.amazonaws.com/Prod/trips",
        headers: { 'x-api-key': AWS_API_KEY_AWS_ACCESS }
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

export function getTrip(tripId, callback){
    axios({
        method: 'get',
        url: `https://ctbw9plo6d.execute-api.us-east-2.amazonaws.com/Prod/trip?id=${tripId}`,
        headers: { 'x-api-key': AWS_API_KEY_AWS_ACCESS }
    })
    .then((response) => {
        //parse the response
        let rawTripResponseArr = response.data;

        callback(null, rawTripResponseArr);
    })
    .catch(function (error) {
        callback(error);
    });
}