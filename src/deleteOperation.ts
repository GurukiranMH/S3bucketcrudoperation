import { AWSError } from 'aws-sdk/lib/error';
import { BucketParams, S3Controller } from './app';
import * as S3 from 'aws-sdk/clients/s3';
import { log } from './app';


export class DeleteOperation {

    public async deleteFilesFromS3(bucketName: string) {
        const bucketParams: BucketParams = { Bucket: bucketName };
        return await new Promise((resolve, reject) => {
            S3Controller.getS3Bucket().listObjects(bucketParams, (err: AWSError, data: S3.ListObjectsOutput) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }).then((data) => {
            const result = data as S3.ListObjectsOutput;
            return result.Contents?.map(async (content) => {
                const key: string = content.Key || '';
                bucketParams['Key'] = key;
                return await new Promise((resolve, reject) => {
                    S3Controller.getS3Bucket().deleteObject(bucketParams, (err: AWSError, data: S3.DeleteObjectOutput) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(key);
                        }
                    });
                });
            });
        }).then(data => {
            const result = data as Iterable<unknown>;
            return Promise.all(result);
        }).catch(err => {
            log.error(err);
        });
    }

    public async deleteBucket(bucketName: string) {
        const bucketParams = { Bucket: bucketName };
        return await new Promise((resolve, reject) => {
            S3Controller.getS3Bucket().deleteBucket(bucketParams, (err: AWSError) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`Successfully deleted the bucket ${bucketName}`);
                }
            });
        });
    }
}