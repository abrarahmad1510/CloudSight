"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCloudSight = exports.wrapHttpFunction = exports.wrapBackgroundFunction = void 0;
const gcp_agent_1 = require("./gcp-agent");
// Background function wrapper (PubSub, Storage, etc.)
function wrapBackgroundFunction(handler, config) {
    const agent = new gcp_agent_1.GCPCloudFunctionsAgent(config);
    return agent.wrapBackgroundFunction(handler);
}
exports.wrapBackgroundFunction = wrapBackgroundFunction;
// HTTP function wrapper
function wrapHttpFunction(handler, config) {
    const agent = new gcp_agent_1.GCPCloudFunctionsAgent(config);
    return agent.wrapHttpFunction(handler);
}
exports.wrapHttpFunction = wrapHttpFunction;
// Unified wrapper that auto-detects function type
function withCloudSight(handler, config) {
    const agent = new gcp_agent_1.GCPCloudFunctionsAgent(config);
    // Simple detection based on function parameters
    if (handler.length === 2) {
        // Likely an HTTP function (req, res)
        return agent.wrapHttpFunction(handler);
    }
    else {
        // Likely a background function (event, context)
        return agent.wrapBackgroundFunction(handler);
    }
}
exports.withCloudSight = withCloudSight;
