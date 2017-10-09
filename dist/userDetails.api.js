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
        this.dataFile = _path2.default.join(__dirname, '../userData.json');
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

            this.app.post('/api/userDetails', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
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

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(userDetails, null, 4), function (err) {
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
            this.app.get('/api/userDetails', function (req, res) {
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
            this.app.put('/api/userDetails/:id', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var userDetails = JSON.parse(data);
                    var idIndex = 0;
                    var findUserDetailById = userDetails.filter(function (userDetail) {
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
                    _this.fs.writeFile(_this.dataFile, JSON.stringify(userDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(userDetails);
                    });
                });
            });
            this.app.delete('/api/userDetails/:id', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var userDetails = JSON.parse(data);
                    var idIndex = null;
                    var findUserDetailsById = userDetails.filter(function (userDetail) {
                        if (userDetail.id == req.params.id) {
                            idIndex = userDetails.indexOf(userDetail);
                            return userDetail;
                        }
                    });

                    if (idIndex >= 0) {
                        userDetails.splice(idIndex, 1);
                    }

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(userDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(userDetails);
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