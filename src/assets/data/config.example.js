// Template for src/assets/data/config.js (which is git-ignored so credentials
// never enter the repo). Copy this file to config.js and fill in real values.
//
// SECURITY: AWS credentials must NOT ship in client-side code — they end up in
// the built JS bundle. Prefer a backend-proxied/presigned upload endpoint and
// remove these from the browser entirely.
export const config = {
    bucketName: "YOUR_S3_BUCKET",
    region: "ap-south-1",
    accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
};
