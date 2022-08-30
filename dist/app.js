"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Controller = exports.setDateAndTime = exports.previousMenu = exports.log = void 0;
const S3 = require("aws-sdk/clients/s3");
const readline = require("readline");
const winston = require("winston");
const createOperation_1 = require("./createOperation");
const uploadOperation_1 = require("./uploadOperation");
const deleteOperation_1 = require("./deleteOperation");
const downloadOperation_1 = require("./downloadOperation");
exports.log = winston.createLogger({ transports: [new winston.transports.Console()] });
const previousMenu = () => {
    console.log('\npress 6 to go back to Main menu');
};
exports.previousMenu = previousMenu;
const mainMenu = () => {
    console.log("These are the options to do CRUD operation on S3 Buckets\n \n 1.To create the Bucket\n 2.To upload the files to Bucket\n 3.To download objects from Bucket\n 4.To delete files in Bucket\n 5.To delete the Bucket\n 6.Go back to mainMenu\n 7.Exit from operation\n");
};
const alertMessage = () => {
    console.log('You have not entered the bucket previously or maybe bucket is already deleted. So specify the bucket name');
};
const setDateAndTime = () => {
    const date = new Date();
    return `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}-${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`;
};
exports.setDateAndTime = setDateAndTime;
let readTerminalInfo = readline.createInterface(process.stdin, process.stdout);
let currentBucketName;
class S3Controller {
    static getS3Bucket() {
        return new S3({ region: 'ap-south-1' });
    }
}
exports.S3Controller = S3Controller;
const createOperation = new createOperation_1.CreateBucket();
const uploadOperation = new uploadOperation_1.UploadFileToS3Bucket();
const deleteOperation = new deleteOperation_1.DeleteOperation();
const downloadOperation = new downloadOperation_1.DownloadOperation();
mainMenu();
readTerminalInfo.on('line', (option) => {
    switch (Number(option)) {
        case 1:
            readTerminalInfo.question('Enter a bucketName to create bucket: ', (inputBucketName) => {
                currentBucketName = inputBucketName;
                createOperation.createBucket(inputBucketName)
                    .then((result) => {
                    exports.log.info(result);
                    (0, exports.previousMenu)();
                }).catch((err) => {
                    exports.log.error(err);
                });
            });
            break;
        case 2:
            console.log('If you want upload single file select 1 and for to upload folder select 2');
            readTerminalInfo.question('1.Upload file\n2.Upload folder with files\n', (option) => {
                switch (Number(option)) {
                    case 1:
                        if (!currentBucketName) {
                            alertMessage();
                            readTerminalInfo.question('Enter a bucketName to upload the files to bucket: ', (newBucketName) => {
                                currentBucketName = newBucketName;
                                readTerminalInfo.question('Enter folder name :', (filePath) => {
                                    uploadOperation.singleFileUpload(newBucketName, filePath)
                                        .then((data) => {
                                        console.log(data);
                                    }).catch(err => {
                                        exports.log.error(err);
                                    });
                                });
                            });
                        }
                        else {
                            readTerminalInfo.question('Select the option:\n 1.To you want to upload the file to previoulsy entered bucket\n 2.specify the bucket name in which you want to upload\n', (option) => {
                                switch (Number(option)) {
                                    case 1:
                                        readTerminalInfo.question('Enter folder name :', (filePath) => {
                                            uploadOperation.singleFileUpload(currentBucketName, filePath)
                                                .then(data => {
                                                exports.log.info(data);
                                                (0, exports.previousMenu)();
                                            }).catch(err => exports.log.error(err));
                                        });
                                        break;
                                    case 2:
                                        readTerminalInfo.question('Enter a bucketName to upload the file to bucket: ', (newBucketName) => {
                                            readTerminalInfo.question('Enter folder name :', (filePath) => {
                                                uploadOperation.singleFileUpload(newBucketName, filePath)
                                                    .then(data => {
                                                    exports.log.info(data);
                                                    (0, exports.previousMenu)();
                                                }).catch(err => exports.log.error(err));
                                            });
                                        });
                                        break;
                                }
                            });
                        }
                        break;
                    case 2:
                        if (!currentBucketName) {
                            alertMessage();
                            readTerminalInfo.question('Enter a bucketName to upload the files to bucket: ', (newBucketName) => {
                                currentBucketName = newBucketName;
                                readTerminalInfo.question('Enter folder name :', (folderPath) => {
                                    console.log(folderPath);
                                    Promise.all(uploadOperation.multipleFileUpload(newBucketName, folderPath))
                                        .then(data => {
                                        exports.log.info(data);
                                        (0, exports.previousMenu)();
                                    }).catch(err => exports.log.error(err));
                                });
                            });
                        }
                        else {
                            readTerminalInfo.question('Select the option:\n 1.To you want to upload the files to previoulsy entered bucket\n 2.specify the bucket name in which you want to upload\n', (option) => {
                                switch (Number(option)) {
                                    case 1:
                                        readTerminalInfo.question('Enter folder name :', (folderPath) => {
                                            Promise.all(uploadOperation.multipleFileUpload(currentBucketName, folderPath))
                                                .then(data => {
                                                exports.log.info(data);
                                                (0, exports.previousMenu)();
                                            }).catch(err => exports.log.error(err));
                                        });
                                        break;
                                    case 2:
                                        readTerminalInfo.question('Enter a bucketName to upload the files to bucket: ', (newBucketName) => {
                                            readTerminalInfo.question('Enter folder name :', (folderPath) => {
                                                Promise.all(uploadOperation.multipleFileUpload(newBucketName, folderPath))
                                                    .then(data => {
                                                    exports.log.info(data);
                                                    (0, exports.previousMenu)();
                                                })
                                                    .catch(err => exports.log.error(err));
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
                alertMessage();
                readTerminalInfo.question('Enter a bucketName to download files from bucket: ', (newBucketName) => {
                    currentBucketName = newBucketName;
                    readTerminalInfo.question('Enter folder name to download Files:', (folderName) => {
                        downloadOperation.downloadFilesFromS3(newBucketName, `${folderName}`)
                            .then((data) => {
                            exports.log.info(data);
                            exports.log.info(`Files are downloaded in ${folderName}`);
                            (0, exports.previousMenu)();
                        }).catch(err => exports.log.error(err));
                    });
                });
            }
            else {
                readTerminalInfo.question('Select the option:\n 1.To you want to download the files from previoulsy entered bucket\n 2.specify the bucket name in which you want to download files\n', (option) => {
                    switch (Number(option)) {
                        case 1:
                            readTerminalInfo.question('Enter folder name to download Files:', (folderName) => {
                                downloadOperation.downloadFilesFromS3(currentBucketName, `${folderName}`)
                                    .then((data) => {
                                    exports.log.info(data);
                                    exports.log.info(`Files are downloaded in ${folderName}`);
                                    (0, exports.previousMenu)();
                                }).catch(err => exports.log.error(err));
                            });
                            break;
                        case 2:
                            readTerminalInfo.question('Enter a bucketName to download files from bucket: ', (newBucketName) => {
                                readTerminalInfo.question('Enter folder name to download Files:', (folderName) => {
                                    downloadOperation.downloadFilesFromS3(newBucketName, `${folderName}`)
                                        .then((data) => {
                                        exports.log.info(data);
                                        exports.log.info(`Files are downloaded in ${folderName}`);
                                        (0, exports.previousMenu)();
                                    }).catch(err => exports.log.error(err));
                                });
                            });
                            break;
                    }
                });
            }
            break;
        case 4:
            if (!currentBucketName) {
                alertMessage();
                readTerminalInfo.question('Enter a bucketName to delete files in bucket: ', (newBucketName) => {
                    currentBucketName = newBucketName;
                    deleteOperation.deleteFilesFromS3(newBucketName)
                        .then((data) => {
                        exports.log.info(data);
                        (0, exports.previousMenu)();
                    }).catch(err => exports.log.error(err));
                });
            }
            else {
                readTerminalInfo.question('Select the option:\n 1.To you want to delete files from previoulsy entered bucket\n 2.specify the bucket name in which you want to delete files\n', (option) => {
                    switch (Number(option)) {
                        case 1:
                            deleteOperation.deleteFilesFromS3(currentBucketName)
                                .then((data) => {
                                exports.log.info(data);
                                (0, exports.previousMenu)();
                            }).catch(err => exports.log.error(err));
                            break;
                        case 2:
                            readTerminalInfo.question('Enter a bucketName to delete files in bucket: ', (newBucketName) => {
                                deleteOperation.deleteFilesFromS3(newBucketName)
                                    .then((data) => {
                                    exports.log.info(data);
                                    (0, exports.previousMenu)();
                                }).catch(err => exports.log.error(err));
                            });
                            break;
                    }
                });
            }
            break;
        case 5:
            if (!currentBucketName) {
                alertMessage();
                readTerminalInfo.question('Enter a bucketName to delete the bucket: ', (newBucketName) => {
                    currentBucketName = newBucketName;
                    deleteOperation.deleteBucket(newBucketName).then((data) => {
                        exports.log.info(data);
                        currentBucketName = '';
                        (0, exports.previousMenu)();
                    }).catch(err => exports.log.error(err));
                });
            }
            else {
                readTerminalInfo.question('Select the option:\n 1.To you want to delete files from previoulsy entered bucket\n 2.specify the bucket name in which you want to delete files\n', (option) => {
                    switch (Number(option)) {
                        case 1:
                            deleteOperation.deleteBucket(currentBucketName).then((data) => {
                                exports.log.info(data);
                                currentBucketName = '';
                                (0, exports.previousMenu)();
                            }).catch(err => exports.log.error(err));
                            ;
                            break;
                        case 2:
                            readTerminalInfo.question('Enter a bucketName to delete the bucket: ', (newBucketName) => {
                                deleteOperation.deleteBucket(newBucketName).then((data) => {
                                    exports.log.info(data);
                                    currentBucketName = '';
                                    (0, exports.previousMenu)();
                                }).catch(err => exports.log.error(err));
                            });
                            break;
                    }
                });
            }
            break;
        case 6:
            mainMenu();
            break;
        case 7:
            readTerminalInfo.close();
            break;
        default:
            console.log(`option doesn't exists`);
            (0, exports.previousMenu)();
            break;
    }
});
