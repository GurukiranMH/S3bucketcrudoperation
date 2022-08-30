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
exports.DownloadOperation = void 0;
const app_1 = require("./app");
const app_2 = require("./app");
const fs = require("fs");
const path = require("path");
class DownloadOperation {
    downloadFilesFromS3(bucketName, destFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const bucketParams = { Bucket: bucketName };
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
                var _a, _b;
                const result = data;
                try {
                    const dirPath = (_a = fs.mkdirSync(`../${destFolder}`, { recursive: true })) !== null && _a !== void 0 ? _a : '';
                    return (_b = result.Contents) === null || _b === void 0 ? void 0 : _b.map((content) => __awaiter(this, void 0, void 0, function* () {
                        bucketParams['Key'] = content.Key;
                        return yield new Promise((resolve, reject) => {
                            app_1.S3Controller.getS3Bucket().getObject(bucketParams, (err, data) => {
                                var _a, _b;
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(content.Key);
                                    const body = data.Body || '';
                                    if ((_a = content.Key) === null || _a === void 0 ? void 0 : _a.includes('/')) {
                                        const fileName = (_b = content.Key) === null || _b === void 0 ? void 0 : _b.split('/');
                                        fs.writeFileSync(path.join(dirPath, `${fileName[fileName.length - 1]}`), body.toString());
                                    }
                                    else {
                                        fs.writeFileSync(path.join(dirPath, `${content.Key || ''}`), body.toString());
                                    }
                                }
                            });
                        });
                    }));
                }
                catch (error) {
                    app_2.log.error(error);
                }
            }).then(data => {
                const result = data;
                return Promise.all(result);
            }).catch(err => {
                app_2.log.error(err);
            });
        });
    }
}
exports.DownloadOperation = DownloadOperation;
