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
exports.DeleteOperation = void 0;
const app_1 = require("./app");
const app_2 = require("./app");
class DeleteOperation {
    deleteFilesFromS3(bucketName) {
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
                var _a;
                const result = data;
                return (_a = result.Contents) === null || _a === void 0 ? void 0 : _a.map((content) => __awaiter(this, void 0, void 0, function* () {
                    const key = content.Key || '';
                    bucketParams['Key'] = key;
                    return yield new Promise((resolve, reject) => {
                        app_1.S3Controller.getS3Bucket().deleteObject(bucketParams, (err, data) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(key);
                            }
                        });
                    });
                }));
            }).then(data => {
                const result = data;
                return Promise.all(result);
            }).catch(err => {
                app_2.log.error(err);
            });
        });
    }
    deleteBucket(bucketName) {
        return __awaiter(this, void 0, void 0, function* () {
            const bucketParams = { Bucket: bucketName };
            return yield new Promise((resolve, reject) => {
                app_1.S3Controller.getS3Bucket().deleteBucket(bucketParams, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(`Successfully deleted the bucket ${bucketName}`);
                    }
                });
            });
        });
    }
}
exports.DeleteOperation = DeleteOperation;
