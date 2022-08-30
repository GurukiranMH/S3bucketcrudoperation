import * as S3 from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/error';
import { BucketParams, previousMenu, S3Controller } from './app';
import { log, setDateAndTime } from './app';
import * as fs from 'fs';

export class UploadFileToS3Bucket {

    public async requestForSingleFileUpload(bucketParams: S3.PutObjectRequest) {
        return await new Promise((resolve, reject) => {
            S3Controller.getS3Bucket().upload(bucketParams, (err: Error, data: S3.ManagedUpload.SendData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public async singleFileUpload(bucketName: string, filepath: string) {
        const bucketParams: BucketParams = { Bucket: bucketName };
        const getFileName = filepath.split('\\');
        let fileName = getFileName[getFileName.length - 1];
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
            bucketParams['Body'] = fs.readFileSync(filepath);
            const checkObjectExists = result.Contents?.map(content => {
                if (content.Key?.includes('/')) {
                    const getFileName = content.Key.split('/');
                    return getFileName[getFileName.length - 1];
                } else {
                    return content.Key;
                }
            }).includes(fileName);
            if (checkObjectExists) {
                log.info('Object already exists');
                const changeFileName = fileName.split('.');
                changeFileName[0] = `${changeFileName[0]}_${setDateAndTime()}`;
                bucketParams['Key'] = changeFileName.join('.');
                return this.requestForSingleFileUpload(bucketParams);
            } else {
                bucketParams['Key'] = fileName;
                return this.requestForSingleFileUpload(bucketParams);
            }
        }).catch(err => {
            log.error(err);
        });
    }

    private async requestToUploadMultipleFile(bucketParams: S3.PutObjectRequest) {
        return await new Promise((resolve, reject) => {
            S3Controller.getS3Bucket().upload(bucketParams, (err: Error, data: S3.ManagedUpload.SendData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            }
            );
        });
    }


    public multipleFileUpload(bucketName: string, folderPath: string) {
        const bucketParams: BucketParams = { Bucket: bucketName };

        try {
            const files = fs.readdirSync(folderPath);
            return files.map(async (file) => {
                const fileContent = fs.readFileSync(`${folderPath}/${file}`);
                const getFolderName = folderPath.split('\\');
                const folderName = getFolderName[getFolderName.length - 1];
                let bucketKeyValue = `${folderName}/${file}`;
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
                    const setKeyAndBody = (bucketKeyValue: string, fileContent: Buffer) => {
                        bucketParams['Key'] = bucketKeyValue;
                        bucketParams['Body'] = fileContent;
                    };
                    const checkObjectExists = result.Contents?.map(content => content.Key).includes(bucketKeyValue);
                    if (checkObjectExists) {
                        log.info(`Object is already exists`);
                        const changeFileName = file.split('.');
                        changeFileName[0] = `${changeFileName[0]}_${setDateAndTime()}`;
                        bucketKeyValue = `${folderName}/` + changeFileName.join('.');
                        setKeyAndBody(bucketKeyValue, fileContent);
                        return this.requestToUploadMultipleFile(bucketParams).catch(err => {
                            throw err;
                        });
                    } else {
                        log.info(`Object is created with name ${bucketKeyValue}`);
                        setKeyAndBody(bucketKeyValue, fileContent);
                        return this.requestToUploadMultipleFile(bucketParams).catch(err => {
                            throw err;
                        });
                    }
                }).catch(err => {
                    throw err;
                });
            });
        } catch (error) {
            log.error(error);
            console.log(previousMenu);
        }
    }
}