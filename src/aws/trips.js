import {AWS_API_KEY_READONLY, AWS_API_KEY_AWS_ACCESS} from '../configski';
import axios from 'axios';
import {defaultErrorResponse} from './networkConsts';

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
        if(error.response){
            return callback(error.response);
        }
        callback(defaultErrorResponse);
    });
}

export function getTrip(tripId, callback){
    axios({
        method: 'get',
        url: `https://ctbw9plo6d.execute-api.us-east-2.amazonaws.com/Prod/trip?id=${tripId}`,
        headers: { 'X-Api-Key': AWS_API_KEY_AWS_ACCESS }
    })
    .then((response) => {
        //parse the response
        let rawTripResponseArr = response.data;

        callback(null, rawTripResponseArr);
    })
    .catch(function (error) {
        if(error.response){
            return callback(error.response);
        }
        return callback(defaultErrorResponse);
    });
}

export function createTrip(newTripInfo, callback){
    axios({
        method: 'post',
        url: `https://ctbw9plo6d.execute-api.us-east-2.amazonaws.com/Prod/trip`,
        headers: { 'X-Api-Key': AWS_API_KEY_AWS_ACCESS },
        data: newTripInfo
    })
    .then((response) => {
        //parse the response
        let rawTripResponse = response.data;

        callback(null, rawTripResponse);
    })
    .catch(function (error) {
        if(error.response){
            return callback(error.response);
        }
        return callback(defaultErrorResponse);
    });
}

