import { BucketParams, S3Controller } from './app';
import * as S3 from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/error';


export class CreateBucket {
    public async createBucket(bucketName: string) {
        const bucketParams: BucketParams = { Bucket: bucketName };
        return await new Promise((resolve, reject) => {
            S3Controller.getS3Bucket().createBucket(bucketParams, (err: AWSError, data: S3.CreateBucketOutput) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(data);
                }
            });
        });
    }
}

