import { AWSError } from 'aws-sdk/lib/error';
import { S3Controller, BucketParams } from './app';
import * as S3 from 'aws-sdk/clients/s3';
import { log } from './app';
import * as fs from 'fs';
import * as path from 'path';


export class DownloadOperation {
    public async downloadFilesFromS3(bucketName: string, destFolder: string) {
        const bucketParams: BucketParams = { Bucket: bucketName };
        return await new Promise((resolve, reject) => {
            S3Controller.getS3Bucket().listObjects(bucketParams, (err: AWSError, data: S3.ListObjectsOutput) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        }).then((data) => {
            const result = data as S3.ListObjectsOutput;
            try {
                const dirPath: string = fs.mkdirSync(`../${destFolder}`, { recursive: true }) ?? '';
                return result.Contents?.map(async (content) => {
                    bucketParams['Key'] = content.Key;
                    return await new Promise((resolve, reject) => {
                        S3Controller.getS3Bucket().getObject(bucketParams, (err: AWSError, data: S3.GetObjectOutput) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(content.Key);
                                const body = data.Body || '';
                                if (content.Key?.includes('/')) {
                                    const fileName = content.Key?.split('/');
                                    fs.writeFileSync(path.join(dirPath, `${fileName[fileName.length - 1]}`), body.toString());
                                } else {
                                    fs.writeFileSync(path.join(dirPath, `${content.Key || ''}`), body.toString());
                                }
                            }
                        });
                    });
                });
            } catch (error) {
                log.error(error);
            }
        }).then(data => {
            const result = data as Iterable<unknown>;
            return Promise.all(result);
        }).catch(err => {
            log.error(err);
        });

    }
}