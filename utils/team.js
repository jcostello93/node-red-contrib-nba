var NBA = require("nba");
var node_helper = require("./node_helper.js");
var nba_helper = require("./nba_helper.js");

var parseField = node_helper.parseField; 
var playerTeamHelper = nba_helper.playerTeamHelper;

function getTeamSchedule(params) {
    return new Promise((resolve, reject) => {
        NBA.data.teamSchedule(params.season.substring(0, 4), params.team_id)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function getTeamLeaders(params) {
    return new Promise((resolve, reject) => {
        NBA.data.teamLeaders(params.season.substring(0, 4), params.team_id)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function getTeamMethodDict() {
    var method_dict = {
        "profile":NBA.stats.teamInfoCommon,
        "stats": NBA.stats.teamStats,
        "roster": NBA.stats.commonTeamRoster,
        "schedule": getTeamSchedule,
        "lineups": NBA.stats.lineups,
        "player_shooting": NBA.stats.playerShooting,
        "team_shooting": NBA.stats.teamShooting,
        "splits": NBA.stats.teamSplits,
        "shot chart": NBA.stats.shots,
        "on/off details": NBA.stats.teamPlayerOnOffDetails,
        "leaders": getTeamLeaders
    }
    return method_dict; 
}

function getTeamNodeProps() {
    return [
        "team_id",
        "per_mode",
        "measure_type",
        "group_quantity",
        "player_team",
        "team_type",
        "season",
        "season_type"
    ]
}

function getTeamProps(n, msg) {
    var props = {};

    var node_props = getTeamNodeProps(); 

    node_props.forEach((prop) => {  
        props[prop] = parseField(msg, n[prop], prop)
    })

    props.team_id = parseInt(props.team_id);    

    props.player_team = playerTeamHelper(props.player_team);  


    if (props.team_type === "shooting") {
        props.team_type = (props.player_team === "P") ? "player_shooting" : "team_shooting";
    }

    return props;
}

function getTeamParams(props) {
    var params_dict = {
        "profile": {TeamID: props.team_id},
        "stats": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type},
        "roster": {TeamID: props.team_id, Season: props.season},
        "schedule": {team_id: props.team_id, season: props.season},
        "lineups": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, MeasureType: props.measure_type, GroupQuantity: props.group_quantity},
        "player_shooting": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
        "team_shooting": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
        "splits": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, MeasureType: props.measure_type},
        "shot chart": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type},
        "on/off details": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
        "leaders": {team_id: props.team_id, season: props.season, season_type: props.season_type, per_mode: props.per_mode},
    }
    return params_dict; 
}

module.exports = {
    getTeamMethodDict,
    getTeamProps,
    getTeamParams
}