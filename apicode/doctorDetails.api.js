import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
// Load the full build.
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');

class Server {
    constructor() {
        this.app = express();
        this.fs = fs;
        this.dataFile = path.join(__dirname, '../doctorData.json');
    }
    configureApp() {
        this.app.set('port', (process.env.PORT || 3000));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }
    configureCORS() {
        // Additional middleware which will set headers that we need on each request.
        this.app.use((req, res, next) => {
            // Set permissive CORS header - this allows this server to be used only as
            // an API server in conjunction with something like webpack-dev-server.
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

            // Disable caching so we'll always get the latest userDetails.
            res.setHeader('Cache-Control', 'no-cache');
            next();
        });
    }
    configureRoutes() {
        this.app.get('/api/doctorDetails', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                var unsortedData = JSON.parse(data);
                //console.log("Unsorted: " + JSON.stringify(unsortedData) + "\n");
                sortedData = _.sortBy(unsortedData, 'id');
                //console.log("Sorted: " + JSON.stringify(sortedData.reverse()));
                var sortedData = JSON.stringify(sortedData.reverse());
                //console.log("Testing: " + JSON.parse(sortedData) + "\n");
                res.json(JSON.parse(sortedData));
            });
        });
        this.app.post('/api/doctorDetails', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                var doctorDetails = JSON.parse(data);
                var newDoctorDetails = {
                    id: Date.now(),
                    name: req.body.name,
                    picUrl: req.body.picUrl,
                    briefDescription: {
                        speciality: req.body.briefDescription.speciality,
                        experience: req.body.briefDescription.experience,
                        description: req.body.briefDescription.description
                    },
                    status: req.body.status,
                    waitingTime: req.body.waitingTime,
                    videoUrl: req.body.videoUrl,
                    appearUrl: req.body.appearUrl,
                    collapseId: req.body.collapseId,
                    thumbnailUrl: req.body.thumbnailUrl,
                    lastUpdateTime: req.body.lastUpdateTime
                };

                doctorDetails.push(newDoctorDetails);

                this.fs.writeFile(this.dataFile, JSON.stringify(doctorDetails, null, 4), (err) => {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                });
                sortedData = _.sortBy(doctorDetails, 'id');
                var sortedData = JSON.stringify(sortedData.reverse());
                res.json(JSON.parse(sortedData));
            });
        });
        this.app.put('/api/doctorDetails/:id', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let doctorDetails = JSON.parse(data);
                let idIndex = 0;
                let findDoctorDetailById = doctorDetails.filter(doctorDetail => {
                    if (doctorDetail.id == req.params.id) {
                        idIndex = doctorDetails.indexOf(doctorDetail);
                        return doctorDetail;
                    }
                });

                findDoctorDetailById[0].name = req.body.name;
                findDoctorDetailById[0].picUrl = req.body.picUrl;
                findDoctorDetailById[0].briefDescription = {
                    speciality: req.body.briefDescription.speciality,
                    experience: req.body.briefDescription.experience,
                    description: req.body.briefDescription.description
                };
                findDoctorDetailById[0].status = req.body.status;
                findDoctorDetailById[0].waitingTime = req.body.waitingTime;
                findDoctorDetailById[0].rating = req.body.rating;
                findDoctorDetailById[0].videoUrl = req.body.videoUrl;
                findDoctorDetailById[0].appearUrl = req.body.appearUrl;
                findDoctorDetailById[0].collapseId = req.body.collapseId;
                findDoctorDetailById[0].thumbnailUrl = req.body.thumbnailUrl;
                findDoctorDetailById[0].lastUpdateTime = req.body.lastUpdateTime;


                doctorDetails.splice(idIndex, 1, findDoctorDetailById[0]);
                this.fs.writeFile(this.dataFile, JSON.stringify(doctorDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(doctorDetails);
                });
            });
        });
        this.app.delete('/api/doctorDetails/:id', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let doctorDetails = JSON.parse(data);
                let idIndex = null;
                let findDoctorDetailsById = doctorDetails.filter(doctorDetail => {
                    if (doctorDetail.id == req.params.id) {
                        idIndex = doctorDetails.indexOf(doctorDetail);
                        return doctorDetail;
                    }
                });

                if (idIndex >= 0) {
                    doctorDetails.splice(idIndex, 1);
                }

                this.fs.writeFile(this.dataFile, JSON.stringify(doctorDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(doctorDetails);
                });
            });
        });
    }

    listen(port) {
        this.app.listen(port, () => {
            console.log(`Server started: http://localhost:${port}/`);
        });
    }

    run() {
        this.configureApp();
        this.configureCORS()
        this.configureRoutes();
        this.listen(this.app.get('port'));
    }
}
export default Server;