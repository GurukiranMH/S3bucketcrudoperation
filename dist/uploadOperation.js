"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileToS3Bucket = void 0;
const app_1 = require("./app");
const app_2 = require("./app");
const fs = require("fs");
class UploadFileToS3Bucket {
    requestForSingleFileUpload(bucketParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                app_1.S3Controller.getS3Bucket().upload(bucketParams, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    singleFileUpload(bucketName, filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const bucketParams = { Bucket: bucketName };
            const getFileName = filepath.split('\\');
            let fileName = getFileName[getFileName.length - 1];
            return yield new Promise((resolve, reject) => {
                app_1.S3Controller.getS3Bucket().listObjects(bucketParams, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            }).catch(err => { throw err; });
        });
    }
    requestToUploadMultipleFile(bucketParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                app_1.S3Controller.getS3Bucket().upload(bucketParams, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    multipleFileUpload(bucketName, folderPath) {
        const bucketParams = { Bucket: bucketName };
        try {
            const files = fs.readdirSync(folderPath);
            return files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const fileContent = fs.readFileSync(`${folderPath}/${file}`);
                const getFolderName = folderPath.split('\\');
                const folderName = getFolderName[getFolderName.length - 1];
                let bucketKeyValue = `${folderName}/${file}`;
                return yield new Promise((resolve, reject) => {
                    app_1.S3Controller.getS3Bucket().listObjects(bucketParams, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(data);
                        }
                    });
                }).then((data) => {
                    var _a;
                    const result = data;
                    const setKeyAndBody = (bucketKeyValue, fileContent) => {
                        bucketParams['Key'] = bucketKeyValue;
                        bucketParams['Body'] = fileContent;
                    };
                    const checkObjectExists = (_a = result.Contents) === null || _a === void 0 ? void 0 : _a.map(content => content.Key).includes(bucketKeyValue);
                    if (checkObjectExists) {
                        app_2.log.info(`Object is already exists`);
                        const changeFileName = file.split('.');
                        changeFileName[0] = `${changeFileName[0]}_${(0, app_2.setDateAndTime)()}`;
                        bucketKeyValue = `${folderName}/` + changeFileName.join('.');
                        setKeyAndBody(bucketKeyValue, fileContent);
                        return this.requestToUploadMultipleFile(bucketParams);
                    }
                    else {
                        app_2.log.info(`Object is created with name ${bucketKeyValue}`);
                        setKeyAndBody(bucketKeyValue, fileContent);
                        return this.requestToUploadMultipleFile(bucketParams);
                    }
                }).catch(err => app_2.log.error(err));
            }));
        }
        catch (error) {
            app_2.log.error(error);
            (0, app_1.previousMenu)();
        }
    }
}
exports.UploadFileToS3Bucket = UploadFileToS3Bucket;
