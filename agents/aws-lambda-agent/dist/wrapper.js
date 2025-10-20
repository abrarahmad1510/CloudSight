"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCloudSight = void 0;
const agent_1 = require("./agent");
function withCloudSight(handler, config) {
    const agent = new agent_1.CloudSightAgent(config);
    return agent.wrapHandler(handler);
}
exports.withCloudSight = withCloudSight;
