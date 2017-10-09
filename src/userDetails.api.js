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
        this.dataFile = path.join(__dirname, '../userData.json');
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
        this.app.post('/api/userDetails', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                var userDetails = JSON.parse(data);
                var newUserDetails = {
                    id: Date.now(),
                    name: req.body.name,
                    email: req.body.email,
                    phoneno: req.body.phoneno,
                    picUrl: req.body.picUrl,
                    briefDescription: {
                        description: req.body.briefDescription.description
                    },
                    status: req.body.status,
                    waitingTime: req.body.waitingTime,
                    rating: req.body.rating,
                    //creationTime: Date.now(),
                    //how to take waiting time nad lstupdate time and id
                    lastUpdateTime: req.body.lastUpdateTime
                };

                userDetails.push(newUserDetails);

                this.fs.writeFile(this.dataFile, JSON.stringify(userDetails, null, 4), (err) => {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                });
                sortedData = _.sortBy(userDetails, 'id');
                var sortedData = JSON.stringify(sortedData.reverse());
                res.json(JSON.parse(sortedData));
            });
        });
        this.app.get('/api/userDetails', (req, res) => {
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
        this.app.put('/api/userDetails/:id', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let userDetails = JSON.parse(data);
                let idIndex = 0;
                let findUserDetailById = userDetails.filter(userDetail => {
                    if (userDetail.id == req.params.id) {
                        idIndex = userDetails.indexOf(userDetail);
                        return userDetail;
                    }
                });

                findUserDetailById[0].name = req.body.name;
                findUserDetailById[0].email = req.body.email;
                findUserDetailById[0].phoneno = req.body.phoneno;
                findUserDetailById[0].picUrl = req.body.picUrl;
                findUserDetailById[0].briefDescription = {
                    description: req.body.briefDescription.description
                };
                findUserDetailById[0].status = req.body.status;
                findUserDetailById[0].waitingTime = req.body.waitingTime;
                findUserDetailById[0].rating = req.body.rating;



                userDetails.splice(idIndex, 1, findUserDetailById[0]);
                this.fs.writeFile(this.dataFile, JSON.stringify(userDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(userDetails);
                });
            });
        });
        this.app.delete('/api/userDetails/:id', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let userDetails = JSON.parse(data);
                let idIndex = null;
                let findUserDetailsById = userDetails.filter(userDetail => {
                    if (userDetail.id == req.params.id) {
                        idIndex = userDetails.indexOf(userDetail);
                        return userDetail;
                    }
                });

                if (idIndex >= 0) {
                    userDetails.splice(idIndex, 1);
                }

                this.fs.writeFile(this.dataFile, JSON.stringify(userDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(userDetails);
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