'use strict';

var _doctorDetails = require('./doctorDetails.api');

var _doctorDetails2 = _interopRequireDefault(_doctorDetails);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _doctorDetails2.default(); //import Server from './userDetails.api';

server.run();