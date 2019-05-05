var NBA = require("nba");
var node_helper = require("./node_helper.js")
var nba_helper = require("./nba_helper.js");

var parseField = node_helper.parseField; 
var playerTeamHelper = nba_helper.playerTeamHelper;

function getLeagueMethodDict() {
    var method_dict = {
        "scoreboard": getScoreboard,
        "leaders": NBA.stats.leagueLeaders,
        "standings": NBA.stats.leagueStandings,
        "game log": NBA.stats.leagueGameLog,
        "player tracking": NBA.stats.playerTracking,
        "player_shooting": NBA.stats.playerShooting,
        "team_shooting": NBA.stats.teamShooting,
        "player_hustle": NBA.stats.playerHustle,
        "team_hustle": NBA.stats.teamHustle,
        "player_clutch": NBA.stats.playerClutch,
        "team_clutch": NBA.stats.teamClutch,
        "lineups": NBA.stats.lineups,
        "schedule": getLeagueSchedule,
        "playoffs bracket": getPlayoffsBracket		
    }
    return method_dict; 
}

function getLeagueNodeProps() {
    return [
        "league_type",
        "game_date",
        "per_mode",
        "season",
        "season_type",
        "stat_category",
        "sorter",
        "player_or_team",
        "ahead_behind",
        "point_diff",
        "clutch_time",
        "measure_type",
        "pt_measure_type",
        "group_quantity",
        "close_def_dist_range",
        "dribble_range",
        "touch_time_range",
        "shot_clock_range",
        "general_range"
    ];
}

function getLeagueProps(n, msg) {
    var props = {};

    var node_props = getLeagueNodeProps();     

    node_props.forEach((prop) => {  
        props[prop] = parseField(msg, n[prop], prop)
    })

    props.player_or_team = playerTeamHelper(props.player_or_team);  

    // There are 2 different endpoints for player and team, as opposed to a single endpoint with a PlayerOrTeam parameter 
    if (props.league_type === "shooting") {
        props.league_type = (props.player_or_team === "P") ? "player_shooting" : "team_shooting";
    } else if (props.league_type === "hustle") {
        props.league_type = (props.player_or_team === "P") ? "player_hustle" : "team_hustle";
    } else if (props.league_type === "clutch") {
        props.league_type = (props.player_or_team === "P") ? "player_clutch" : "team_clutch";
    } else if (props.league_type === "player tracking") {
        // This particular endpoint wants "Player"/"Team" instead of "P"/"T" https://github.com/bttmly/nba-client-template/blob/master/nba.json
        props.player_or_team = (props.player_or_team === "P") ? "Player" : "Team";
    } 

    return props; 
}

function getLeagueParamsDict(props) {
    var params_dict = {
        "scoreboard": {game_date: props.game_date},
        "leaders": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, StatCategory: props.stat_category},
        "standings": {Season: props.season, SeasonType: props.season_type},
        "game log": {PlayerOrTeam: props.player_or_team, Season: props.season, SeasonType: props.season_type, Sorter: props.sorter},
        "player tracking": {PlayerOrTeam: props.player_or_team, Season: props.season, SeasonType: props.season_type, PtMeasureType: props.pt_measure_type, PerMode: props.per_mode},
        "player_shooting": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, CloseDefDistRange: props.close_def_dist_range, DribbleRange: props.dribble_range, TouchTimeRange: props.touch_time_range, ShotClockRange: props.shot_clock_range, GeneralRange: props.general_range},
        "team_shooting": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, CloseDefDistRange: props.close_def_dist_range, DribbleRange: props.dribble_range, TouchTimeRange: props.touch_time_range, ShotClockRange: props.shot_clock_range, GeneralRange: props.general_range},
        "player_hustle": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
        "team_hustle": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
        "player_clutch": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, AheadBehind: props.ahead_behind, ClutchTime: props.clutch_time, PointDiff: props.point_diff},
        "team_clutch": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, AheadBehind: props.ahead_behind, ClutchTime: props.clutch_time, PointDiff: props.point_diff},
        "lineups": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, MeasureType: props.measure_type, GroupQuantity: props.group_quantity},
        "schedule": {season: props.season},
        "playoffs bracket": {season: props.season}
    }
    return params_dict; 
}

function getLeagueSchedule(params) {
    return new Promise((resolve, reject) => {
        NBA.data.schedule(params.season.substring(0, 4))
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function getPlayoffsBracket(params) {
    return new Promise((resolve, reject) => {
        NBA.data.playoffsBracket(params.season.substring(0, 4))
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function getScoreboard(params) {
    var game_date = params.game_date.replace(/-/g, "").replace(/\//g, '');
    return new Promise((resolve, reject) => {
        NBA.data.scoreboard(game_date)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

module.exports = {
    getLeagueMethodDict,
    getLeagueProps,
    getLeagueParamsDict
};