var NBA = require("nba");
var node_helper = require("./node_helper.js")

var parseField = node_helper.parseField; 

function getPlayerNodeProps() {
    return [
        "player_id",
        "player_type",
        "season",
        "season_type",
        "measure_type",
        "per_mode"
    ]
}

function getPlayerMethodDict() {
    var method_dict = {
        "profile": NBA.stats.playerInfo,
        "stats": NBA.stats.playerProfile,
        "shot chart": NBA.stats.shots,
        "splits": NBA.stats.playerSplits,
        "shot dashboard": NBA.stats.playerShooting
    }
    return method_dict;
}

function getPlayerProps(n, msg) {
    var props = {}; 

    var node_props = getPlayerNodeProps(); 

    node_props.forEach((prop) => {  
        props[prop] = parseField(msg, n[prop], prop)
    })

    props.player_id = parseInt(props.player_id); 

    return props; 
}

function getPlayerParamsDict(props) {
    var params_dict = {
        "profile": {PlayerID: props.player_id},
        "stats": {PlayerID: props.player_id},
        "shot chart": {PlayerID: props.player_id, Season: props.season, SeasonType: props.season_type},
        "splits": {PlayerID: props.player_id, Season: props.season, SeasonType: props.season_type, MeasureType: props.measure_type}
    }
    return params_dict; 
}

module.exports = {
    getPlayerMethodDict,
    getPlayerProps,
    getPlayerParamsDict
}