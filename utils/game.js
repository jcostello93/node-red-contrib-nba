var NBA = require("nba");
var node_helper = require("./node_helper.js");
var nba_helper = require("./nba_helper.js");

var convertData = nba_helper.convertData;
var parseField = node_helper.parseField; 

function getPreviewArticle(params) {
    return new Promise((resolve, reject) => {
        var game_date = params.game_date.replace(/-/g, "").replace(/\//g, '');
        NBA.data.previewArticle(game_date, params.game_id)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function getRecapArticle(params) {
    return new Promise((resolve, reject) => {
        var game_date = params.game_date.replace(/-/g, "").replace(/\//g, '');
        NBA.data.recapArticle(game_date, params.game_id)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function getLeadTracker(params) {
    return new Promise((resolve, reject) => {
        var game_date = params.game_date.replace(/-/g, "").replace(/\//g, '');
        NBA.data.leadTracker(game_date, params.game_id, params.period)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function boxScoreLive(params) {
    return new Promise((resolve, reject) => {
        var game_date = params.game_date.replace(/-/g, "").replace(/\//g, '');
        NBA.data.boxScore(game_date, params.game_id)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

function playByPlayLive(params) {
    return new Promise((resolve, reject) => {
        var game_date = params.game_date.replace(/-/g, "").replace(/\//g, '');
        NBA.data.playByPlay(game_date, params.game_id)
        .then(body => { resolve(body); })
        .catch (err => { reject(err); })
    })
}

// Calls getBoxScore and returns a promise to preserve the call structure in GameNode
function boxScorePromise(params) {
    return new Promise((resolve, reject) => {
        getBoxScore(params, (payload, error) => {
            if (error) {
                reject(error);
            } else {
                resolve(payload); 
            }
        })
    })
}

// Calls callback from boxScorePromise when both API calls have finished
function getBoxScore(params, cb) {
    var payload = {};		
    var callback_count = 0;
    NBA.stats.boxScore(params)
        .then(response => { 
            payload.playerStats = convertData(response.resultSets[0])
            payload.teamStats = convertData(response.resultSets[1])
            payload.starterBenchStats = convertData(response.resultSets[2])
            complete(); 
        })
        .catch(error => {  cb(null, error) })
    NBA.stats.boxScoreSummary(params)
        .then (response => {
            payload.gameSummary = convertData(response.resultSets[0])[0];
            payload.otherStats = convertData(response.resultSets[1]);
            payload.officials = convertData(response.resultSets[2]);
            payload.inactivePlayers = convertData(response.resultSets[3]);
            payload.gameInfo = convertData(response.resultSets[4])[0];
            payload.lineScore = convertData(response.resultSets[5]);
            payload.lastMeeting = convertData(response.resultSets[6])[0];
            payload.seasonSeries = convertData(response.resultSets[7])[0];
            payload.availableVideo = convertData(response.resultSets[8])[0];
            complete();		
        })
        .catch(error => {  cb(null, error) })
    

    // Wait for both calls to complete
    function complete() {
        callback_count++; 
        if (callback_count >= 2) {
            cb(payload, null);
        }
    }
}

function getGameMethodDict() {
    var method_dict = {
        "play-by-play": NBA.stats.playByPlay,
        "play-by-play live": playByPlayLive,
        "shot chart": NBA.stats.shots,
        "box score": boxScorePromise,
        "box score live": boxScoreLive,
        "preview article": getPreviewArticle,
        "recap article": getRecapArticle,
        "lead tracker": getLeadTracker
    }
    return method_dict; 
}

function getGameNodeProps() {
    return [
        "game_type",
        "game_id",
        "live",
        "game_date",
        "period"
    ]
}

function getGameProps(n, msg) {
    var props = {}; 

    var node_props = getGameNodeProps(); 

    node_props.forEach((prop) => {  
        props[prop] = parseField(msg, n[prop], prop)
    })
    
    if (props.game_type === "box score" && props.live === "true") {
        props.game_type = "box score live";
    }

    if (props.game_type === "play-by-play" && props.live === "true") {
        props.game_type = "play-by-play live";
    }

    return props; 
}

function getGameParamsDict(props) {
    // "box score live": {game_date: props.game_date, game_id: props.game_id}
    var params_dict = {
        "play-by-play": {GameID: props.game_id},
        "play-by-play live": {game_date: props.game_date, game_id: props.game_id},
        "shot chart": {GameID: props.game_id},
        "box score": {GameID: props.game_id},
        "box score live": {game_date: props.game_date, game_id: props.game_id},
        "preview article":  {game_date: props.game_date, game_id: props.game_id},
        "recap article":  {game_date: props.game_date, game_id: props.game_id},
        "lead tracker":  {game_date: props.game_date, game_id: props.game_id, period: props.period}
    }
    return params_dict; 
}

module.exports = {
    getGameMethodDict,
    getGameProps,
    getGameParamsDict
}