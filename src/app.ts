import * as S3 from 'aws-sdk/clients/s3';
import * as readline from 'readline';
import * as winston from 'winston';
import { CreateBucket } from './createOperation';
import { UploadFileToS3Bucket } from './uploadOperation';
import { DeleteOperation } from './deleteOperation';
import { DownloadOperation } from './downloadOperation';

export const log = winston.createLogger({ transports: [new winston.transports.Console()] });

export interface BucketParams {
    Bucket: string;
    Key?: string;
    Body?: Buffer;
}

export const previousMenu = '\npress 6 to go back to Main menu';


const mainMenu = "These are the options to do CRUD operation on S3 Buckets\n \n 1.To create the Bucket\n 2.To upload the files to Bucket\n 3.To download objects from Bucket\n 4.To delete files in Bucket\n 5.To delete the Bucket\n 6.Go back to mainMenu\n 7.Exit from operation\n";


const alertMessage = 'You have not entered the bucket previously or maybe bucket is already deleted. So specify the bucket name';


export const setDateAndTime = () => {
    const date = new Date();
    return `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}-${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
};

let readTerminalInfo = readline.createInterface(process.stdin, process.stdout);

let currentBucketName: string;


class S3Controller {

    public static getS3Bucket(): S3 {
        return new S3({ region: 'ap-south-1' });
    }

}

const createOperation = new CreateBucket();
const uploadOperation = new UploadFileToS3Bucket();
const deleteOperation = new DeleteOperation();
const downloadOperation = new DownloadOperation();

console.log(mainMenu);

readTerminalInfo.on('line', (option) => {
    switch (Number(option)) {
        case 1:
            readTerminalInfo.question('Enter a bucketName to create bucket: ', (inputBucketName) => {
                currentBucketName = inputBucketName;
                createOperation.createBucket(inputBucketName)
                    .then((result) => {
                        log.info(result);
                        console.log(previousMenu);
                    }).catch((err) => {
                        log.error(err);
                    });
            });
            break;
        case 2:
            console.log('If you want upload single file select 1 and for to upload folder select 2');
            readTerminalInfo.question('1.Upload file\n2.Upload folder with files\n', (option) => {
                switch (Number(option)) {
                    case 1:
                        if (!currentBucketName) {
                            console.log(alertMessage);
                            readTerminalInfo.question('Enter a bucketName to upload the files to bucket: ', (newBucketName) => {
                                currentBucketName = newBucketName;
                                readTerminalInfo.question('Enter folder name :', (filePath) => {
                                    uploadOperation.singleFileUpload(newBucketName, filePath)
                                        .then((data) => {
                                            log.info(data);
                                            console.log(previousMenu);
                                        }).catch(err => {
                                            log.error(err);
                                        });
                                });
                            });
                        } else {
                            readTerminalInfo.question('Select the option:\n 1.To you want to upload the file to previoulsy entered bucket\n 2.specify the bucket name in which you want to upload\n', (option) => {
                                switch (Number(option)) {
                                    case 1:
                                        readTerminalInfo.question('Enter folder name :', (filePath) => {
                                            uploadOperation.singleFileUpload(currentBucketName, filePath)
                                                .then(data => {
                                                    log.info(data);
                                                    console.log(previousMenu);
                                                }).catch(err => log.error(err));
                                        });
                                        break;
                                    case 2:
                                        readTerminalInfo.question('Enter a bucketName to upload the file to bucket: ', (newBucketName) => {
                                            readTerminalInfo.question('Enter folder name :', (filePath) => {
                                                uploadOperation.singleFileUpload(newBucketName, filePath)
                                                    .then(data => {
                                                        log.info(data);
                                                        console.log(previousMenu);
                                                    }).catch(err => log.error(err));
                                            });
                                        });
                                        break;
                                }
                            });
                        }
                        break;
                    case 2:
                        if (!currentBucketName) {
                            console.log(alertMessage);
                            readTerminalInfo.question('Enter a bucketName to upload the files to bucket: ', (newBucketName) => {
                                currentBucketName = newBucketName;
                                readTerminalInfo.question('Enter folder name :', (folderPath) => {
                                    console.log(folderPath);
                                    Promise.all(uploadOperation.multipleFileUpload(newBucketName, folderPath) ?? '')
                                        .then(data => {
                                            log.info(data);
                                            console.log(previousMenu);
                                        }).catch(err => log.error(err));
                                });
                            });
                        } else {
                            readTerminalInfo.question('Select the option:\n 1.To you want to upload the files to previoulsy entered bucket\n 2.specify the bucket name in which you want to upload\n', (option) => {
                                switch (Number(option)) {
                                    case 1:
                                        readTerminalInfo.question('Enter folder name :', (folderPath) => {
                                            Promise.all(uploadOperation.multipleFileUpload(currentBucketName, folderPath) ?? '')
                                                .then(data => {
                                                    log.info(data);
                                                    console.log(previousMenu);
                                                }).catch(err => log.error(err));
                                        });
                                        break;
                                    case 2:
                                        readTerminalInfo.question('Enter a bucketName to upload the files to bucket: ', (newBucketName) => {
                                            readTerminalInfo.question('Enter folder name :', (folderPath) => {
                                                Promise.all(uploadOperation.multipleFileUpload(newBucketName, folderPath) ?? '')
                                                    .then(data => {
                                                        log.info(data);
                                                        console.log(previousMenu);
                                                    })
                                                    .catch(err => log.error(err));
                                            });
                                        });
                                        break;
                                }
                            });
                        }
                }
            });
            break;
        case 3:
            if (!currentBucketName) {
                console.log(alertMessage);
                readTerminalInfo.question('Enter a bucketName to download files from bucket: ', (newBucketName) => {
                    currentBucketName = newBucketName;
                    readTerminalInfo.question('Enter folder name to download Files:', (folderName) => {
                        downloadOperation.downloadFilesFromS3(newBucketName, `${folderName}`)
                            .then((data) => {
                                log.info(data);
                                log.info(`Files are downloaded in ${folderName}`);
                                console.log(previousMenu);
                            }).catch(err => log.error(err));
                    });
                });
            } else {
                readTerminalInfo.question('Select the option:\n 1.To you want to download the files from previoulsy entered bucket\n 2.specify the bucket name in which you want to download files\n', (option) => {
                    switch (Number(option)) {
                        case 1:
                            readTerminalInfo.question('Enter folder name to download Files:', (folderName) => {
                                downloadOperation.downloadFilesFromS3(currentBucketName, `${folderName}`)
                                    .then((data) => {
                                        log.info(data);
                                        log.info(`Files are downloaded in ${folderName}`);
                                        console.log(previousMenu);
                                    }).catch(err => log.error(err));
                            });
                            break;
                        case 2:
                            readTerminalInfo.question('Enter a bucketName to download files from bucket: ', (newBucketName) => {
                                readTerminalInfo.question('Enter folder name to download Files:', (folderName) => {
                                    downloadOperation.downloadFilesFromS3(newBucketName, `${folderName}`)
                                        .then((data) => {
                                            log.info(data);
                                            log.info(`Files are downloaded in ${folderName}`);
                                            console.log(previousMenu);
                                        }).catch(err => log.error(err));
                                });
                            });
                            break;
                    }
                });
            }
            break;

        case 4:
            if (!currentBucketName) {
                console.log(alertMessage);
                readTerminalInfo.question('Enter a bucketName to delete files in bucket: ', (newBucketName) => {
                    currentBucketName = newBucketName;
                    deleteOperation.deleteFilesFromS3(newBucketName)
                        .then((data) => {
                            log.info(data);
                            console.log(previousMenu);
                        }).catch(err => log.error(err));
                });
            }
            else {
                readTerminalInfo.question('Select the option:\n 1.To you want to delete files from previoulsy entered bucket\n 2.specify the bucket name in which you want to delete files\n', (option) => {
                    switch (Number(option)) {
                        case 1:
                            deleteOperation.deleteFilesFromS3(currentBucketName)
                                .then((data) => {
                                    log.info(data);
                                    console.log(previousMenu);
                                }).catch(err => log.error(err));
                            break;
                        case 2:
                            readTerminalInfo.question('Enter a bucketName to delete files in bucket: ', (newBucketName) => {
                                deleteOperation.deleteFilesFromS3(newBucketName)
                                    .then((data) => {
                                        log.info(data);
                                        console.log(previousMenu);
                                    }).catch(err => log.error(err));
                            });
                            break;
                    }
                });
            }
            break;

        case 5:
            if (!currentBucketName) {
                console.log(alertMessage);
                readTerminalInfo.question('Enter a bucketName to delete the bucket: ', (newBucketName) => {
                    currentBucketName = newBucketName;
                    deleteOperation.deleteBucket(newBucketName).then((data) => {
                        log.info(data);
                        currentBucketName = '';
                        console.log(previousMenu);
                    }).catch(err => log.error(err));
                });
            } else {
                readTerminalInfo.question('Select the option:\n 1.To you want to delete files from previoulsy entered bucket\n 2.specify the bucket name in which you want to delete files\n', (option) => {
                    switch (Number(option)) {
                        case 1:
                            deleteOperation.deleteBucket(currentBucketName).then((data) => {
                                log.info(data);
                                currentBucketName = '';
                                console.log(previousMenu);
                            }).catch(err => log.error(err));;
                            break;
                        case 2:
                            readTerminalInfo.question('Enter a bucketName to delete the bucket: ', (newBucketName) => {
                                deleteOperation.deleteBucket(newBucketName).then((data) => {
                                    log.info(data);
                                    currentBucketName = '';
                                    console.log(previousMenu);
                                }).catch(err => log.error(err));
                            });
                            break;
                    }
                });
            }
            break;

        case 6:
            console.log(mainMenu);
            break;

        case 7:
            readTerminalInfo.close();
            break;

        default:
            console.log(`option doesn't exists`);
            console.log(previousMenu);
            break;
    }
});

export { S3Controller };