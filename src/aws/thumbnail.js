import AWS from 'aws-sdk';
import uuidv1 from 'uuid/v1';

import { AWS_S3_BUCKET_NAME } from '../configski';
import { AWS_S3_REGION, AWS_IDENTITY_POOL_ID_AWS_ACCESS } from '../configski';

export function uploadPhotoThumbnail(file, tripName, callback) {
    // cant do stuff without a file
    if(!file){
        return;
    }

    let fileName = uuidv1();
    if(file.name){
        fileName = file.name;
    }
    let blogImageUploadKey = `blog/${tripName}/thumb/${fileName}.png`;

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

    awsS3client.upload(s3Params, (err, data) => {
        callback(err, data);
    });
}