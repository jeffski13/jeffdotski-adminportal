import AWS from 'aws-sdk';
import uuidv1 from 'uuid/v1';

import { AWS_S3_BUCKET_NAME } from '../configski';
import { AWS_S3_REGION, AWS_IDENTITY_POOL_ID_AWS_ACCESS } from '../configski';

/**
 * get all objects in the AWS S3 blogs "directory"
 *
 * @param {object} file - photo file
 * @param {string} tripName - name of the trip for this photo
 * @param {object} awsS3Client - the s3 sdk object
 * @param {function} callback - (error, data) - function with error/data information from s3
 */
export function uploadPhoto(file, tripId, callback) {
    if(!file || !tripId || tripId === ''){
        callback({ message: "No file or tripid while trying to upload photo!"});
        return;
    }

    let fileName = uuidv1();
    if(file.name){
        fileName += file.name;
    }
    let blogImageUploadKey = `blog/${tripId}/${fileName}`;

    AWS.config.update({
        region: AWS_S3_REGION,
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: AWS_IDENTITY_POOL_ID_AWS_ACCESS
        })
    });
    let awsS3client = new AWS.S3({ apiVersion: '2006-03-01' });

    //upload photo
    let s3Params = {
        Key: blogImageUploadKey,
        Body: file,
        Bucket: AWS_S3_BUCKET_NAME,
        ACL: 'public-read'
    };

    console.log('aws upload');
    awsS3client.upload(s3Params, (err, data) => {
        console.log('aws upload done');
        callback(err, data);
    });
}

/**
 * get all objects in the AWS S3 blogs "directory"
 *
 * @param {object} awsS3Client - the s3 sdk object
 * @param {function} callback - (error, blogObjectsArr) - a function that will have the blog objects (or an error)
 */
export function fetchBlogObjects(awsS3Client, callback) {
    let s3Params = { Bucket: AWS_S3_BUCKET_NAME };
    awsS3Client.listObjects(s3Params, (err, data) => {
        if (err) {
            return callback(err);
        }
        else {
            //you got data! wonderful, now put it into a readable array
            let rawContentsArr = data.Contents;

            //turn into string array of directories
            let directoriesKeyArr = [];
            rawContentsArr.forEach(function (contentsItem) {
                directoriesKeyArr.push(contentsItem.Key);
            });
            let blogDirectoriesArrRaw = directoriesKeyArr.filter(directoryKey => directoryKey.startsWith("blog/"));
            callback(null, blogDirectoriesArrRaw);
        }
    });
}