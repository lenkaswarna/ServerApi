'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Load the full build.
var _ = require('lodash');
// Load the core build.
var _ = require('lodash/core');
// Load the FP build for immutable auto-curried iteratee-first data-last methods.
var fp = require('lodash/fp');

var Server = function () {
    function Server() {
        _classCallCheck(this, Server);

        this.app = (0, _express2.default)();
        this.fs = _fs2.default;
        this.dataFile = _path2.default.join(__dirname, '../doctorData.json');
    }

    _createClass(Server, [{
        key: 'configureApp',
        value: function configureApp() {
            this.app.set('port', process.env.PORT || 3000);
            this.app.use(_bodyParser2.default.json());
            this.app.use(_bodyParser2.default.urlencoded({ extended: true }));
        }
    }, {
        key: 'configureCORS',
        value: function configureCORS() {
            // Additional middleware which will set headers that we need on each request.
            this.app.use(function (req, res, next) {
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
    }, {
        key: 'configureRoutes',
        value: function configureRoutes() {
            var _this = this;

            this.app.get('/api/doctorDetails', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
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
            this.app.post('/api/doctorDetails', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
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

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(doctorDetails, null, 4), function (err) {
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
            this.app.put('/api/doctorDetails/:id', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var doctorDetails = JSON.parse(data);
                    var idIndex = 0;
                    var findDoctorDetailById = doctorDetails.filter(function (doctorDetail) {
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
                    _this.fs.writeFile(_this.dataFile, JSON.stringify(doctorDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(doctorDetails);
                    });
                });
            });
            this.app.delete('/api/doctorDetails/:id', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var doctorDetails = JSON.parse(data);
                    var idIndex = null;
                    var findDoctorDetailsById = doctorDetails.filter(function (doctorDetail) {
                        if (doctorDetail.id == req.params.id) {
                            idIndex = doctorDetails.indexOf(doctorDetail);
                            return doctorDetail;
                        }
                    });

                    if (idIndex >= 0) {
                        doctorDetails.splice(idIndex, 1);
                    }

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(doctorDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(doctorDetails);
                    });
                });
            });
        }
    }, {
        key: 'listen',
        value: function listen(port) {
            this.app.listen(port, function () {
                console.log('Server started: http://localhost:' + port + '/');
            });
        }
    }, {
        key: 'run',
        value: function run() {
            this.configureApp();
            this.configureCORS();
            this.configureRoutes();
            this.listen(this.app.get('port'));
        }
    }]);

    return Server;
}();

exports.default = Server;