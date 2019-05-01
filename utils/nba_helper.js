var NBA = require("nba");
var NBA_CLIENT = require("nba-client-template");

function playerObjFromID(player_id) {
    return NBA.players.find(player => player.playerId === player_id);
}

function teamObjFromID(team_id) {
    return NBA.teams.find(team => team.teamId === team_id);
}

function playerTeamHelper(player_team) {
    var param = (player_team) ? player_team.toLowerCase() : ""; 

    return (param === "p" || param === "player") ? "P" : "T";
}

// This function takes an object with a header array and a 2D data array and maps them to an array of objects
// Ex parameters: obj.headers = [PTS, MIN]
//               obj.rowSet = [[25, 37], [40, 35]]

// Ex result:    result = [{PTS: 25, MIN: 37}, {PTS: 40, MIN: 35}]

function convertData(obj) {
    var headers = obj.headers;
    var rowSet = obj.rowSet;

    var result = [];

    for (var i = 0; i < rowSet.length; i++) {
        var tempObj = {};
        for (var j = 0; j < headers.length; j++) {
            tempObj[headers[j]] = rowSet[i][j];
        }
        result.push(tempObj);
    }

    return result; 
}

function cleanData(response) {
    if (response.resultSet) {
        response.cleanedData = convertData(response.resultSet);
    } else if (response.resultSets) {
        response.cleanedData = convertData(response.resultSets[0]);
    }

    return response;
}

function getParamObject(param_name) {
    return NBA_CLIENT.parameters.find(param => param.name === param_name);
}

function addMissingParamDefaultValues() {
    var params = [ 
        getParamObject("ClutchTime"), 
        getParamObject("AheadBehind"), 
        getParamObject("PtMeasureType"), 
    ];
    params.forEach((param) => {
        param.default = param.values[0]; 
    })
}

module.exports = {
    playerObjFromID,
    teamObjFromID,
    convertData,
    cleanData,
    addMissingParamDefaultValues,
    playerTeamHelper
}