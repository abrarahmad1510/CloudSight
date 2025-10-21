"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapHttpFunction = exports.wrapBackgroundFunction = exports.withCloudSight = exports.GCPCloudFunctionsAgent = void 0;
var gcp_agent_1 = require("./gcp-agent");
Object.defineProperty(exports, "GCPCloudFunctionsAgent", { enumerable: true, get: function () { return gcp_agent_1.GCPCloudFunctionsAgent; } });
var wrapper_1 = require("./wrapper");
Object.defineProperty(exports, "withCloudSight", { enumerable: true, get: function () { return wrapper_1.withCloudSight; } });
Object.defineProperty(exports, "wrapBackgroundFunction", { enumerable: true, get: function () { return wrapper_1.wrapBackgroundFunction; } });
Object.defineProperty(exports, "wrapHttpFunction", { enumerable: true, get: function () { return wrapper_1.wrapHttpFunction; } });
