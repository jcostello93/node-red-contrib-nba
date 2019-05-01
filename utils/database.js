var NBA = require("nba");
var node_helper = require("./node_helper.js")
var nba_helper = require("./nba_helper.js")

var parseField = node_helper.parseField; 
var playerObjFromID = nba_helper.playerObjFromID;
var teamObjFromID = nba_helper.teamObjFromID;

function _updatePlayers() {
    NBA.updatePlayers(); 
    return getAllPlayers(); 
}

function getAllPlayers() {
    return NBA.players;
}

function getAllTeams() {
    return NBA.teams;
}

function getOnePlayer(props) {
    var id = (props.source === "name") ? parseInt(NBA.findPlayer(props.first_name + " " + props.last_name).playerId) : props.object_id;
    return playerObjFromID(id);
}

function getOneTeam(props) {
    var id = (props.source === "name") ? parseInt(NBA.teamIdFromName(props.team_name)) : props.object_id;
    return teamObjFromID(id);
}

function getDatabaseNodeProps() {
    return [
        "database_type",
        "get_type",
        "first_name",
        "last_name",
        "team_name",
        "source",
        "object_id"
    ]
}

function getDatabaseProps(n, msg) {
    var props = {}; 

    var node_props = getDatabaseNodeProps(); 

    node_props.forEach((prop) => {  
        props[prop] = parseField(msg, n[prop], prop)
    })

    props.object_id = parseInt(props.object_id); 
    return props; 
}

function getDatabaseData(props) {
    var method_dict = {
        "all players": getAllPlayers,
        "all teams": getAllTeams,
        "one player": getOnePlayer,
        "one team": getOneTeam							
    }		

    return method_dict[props.get_type](props);
}

function getDatabaseMethodDict() {
    var method_dict = {
        "update": _updatePlayers,
        "get data": getDatabaseData 				
    }
    return method_dict;
}

function getDatabaseParamsDict(props) {
    var params_dict = {
        "update": null,
        "get data": props
    }
    return params_dict; 
}

module.exports = {
    getDatabaseProps,
    getDatabaseMethodDict,
    getDatabaseParamsDict
}