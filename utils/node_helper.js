var mustache = require("mustache");

function parseField(msg, nodeProp, msgProp) {
    var field;
    var isTemplatedField = (nodeProp||"").indexOf("{{") != -1

    if (isTemplatedField) {
        field = mustache.render(nodeProp,msg);
    } else {
        field = (nodeProp === "dynamic") ? msg[msgProp] : nodeProp;
    }

    return field;
}

function resetNodeStatus(node) {
    node.status({});
}

function setLoadingStatus(node, status_msg) {
    node.status({fill:"blue", shape:"dot", text:status_msg});
}

function setSuccessStatus(node, status_msg) {
    node.status({fill:"green", shape:"dot", text:status_msg});
}

function setErrorStatus(node) {
    node.status({fill:"red", shape:"dot", text:"error"});
}

function sendMsg(node, msg, payload) {
    msg.payload = payload;
    node.send(msg);		
}

function sendError(node, msg, error) {
    node.error(error, msg);		
}

module.exports = {
    parseField,
    resetNodeStatus,
    setLoadingStatus,
    setSuccessStatus,
    setErrorStatus,
    sendMsg,
    sendError
}