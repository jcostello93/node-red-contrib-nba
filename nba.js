module.exports = function(RED) {
    "use strict";
	var NBA = require("nba");
	NBA.updatePlayers();
	var mustache = require("mustache");
	var NBA_CLIENT = require("nba-client-template");	

	// In order of priority: 1. HTML text OR mustache syntax, 2. msg.msgProp 
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

	function playerObjFromID(player_id) {
		return NBA.players.find(player => player.playerId === player_id);
	}

	function teamObjFromID(team_id) {
		return NBA.teams.find(team => team.teamId === team_id);
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

	function getPlayerMethodDict() {
		var method_dict = {
			"profile": NBA.stats.playerInfo,
			"stats": NBA.stats.playerProfile,
			"shot chart": NBA.stats.shots,
			"splits": NBA.stats.playerSplits
		}
		return method_dict;
	}

	function getPlayerProps(n, msg) {
		var props = {}; 
		props.player_id = parseInt(parseField(msg, n.player_id));
		props.player_type = n.player_type;
		props.season = parseField(msg, n.season, "season");
		props.season_type = parseField(msg, n.season_type, "season_type");
		props.measure_type = parseField(msg, n.measure_type, "measure_type");

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

	function getTeamMethodDict() {
		var method_dict = {
			"profile":NBA.stats.teamInfoCommon,
			"stats": NBA.stats.teamStats,
			"roster": NBA.stats.commonTeamRoster,
			"lineups": NBA.stats.lineups,
			"player_shooting": NBA.stats.playerShooting,
			"team_shooting": NBA.stats.teamShooting,
			"splits": NBA.stats.teamSplits,
			"shot chart": NBA.stats.shots
		}
		return method_dict; 
	}

	function getTeamProps(n, msg) {
		var props = {};
		props.team_id = parseInt(parseField(msg, n.team_id));			
		props.per_mode = parseField(msg, n.per_mode, "per_mode");
		props.measure_type = parseField(msg, n.measure_type, "measure_type");
		props.group_quantity = parseField(msg, n.group_quantity, "group_quantity");
		props.p_or_t = parseField(msg, n.player_team, "player_team");			
		props.team_type = parseField(msg, n.team_type);
		props.season = parseField(msg, n.season, "season");
		props.season_type = parseField(msg, n.season_type, "season_type");
		

		if (props.team_type === "shooting") {
			props.team_type = (props.p_or_t === "P") ? "player_shooting" : "team_shooting";
		}

		return props;
	}

	function getTeamParams(props) {
		var params_dict = {
			"profile": {TeamID: props.team_id},
			"stats": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type},
			"roster": {TeamID: props.team_id, Season: props.season},
			"lineups": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, MeasureType: props.measure_type, GroupQuantity: props.group_quantity},
			"player_shooting": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
			"team_shooting": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
			"splits": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type, MeasureType: props.measure_type},
			"shot chart": {TeamID: props.team_id, Season: props.season, SeasonType: props.season_type}
		}
		return params_dict; 
	}

	function getLeagueMethodDict() {
		var method_dict = {
			"scoreboard": NBA.stats.scoreboard,
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
			"lineups": NBA.stats.lineups
		}
		return method_dict; 
	}

	function getLeagueProps(n, msg) {
		var props = {};
		props.league_type = n.league_type;
		props.game_date = parseField(msg, n.game_date);	
		props.per_mode = parseField(msg, n.per_mode, "per_mode");
		props.season = parseField(msg, n.season, "season");
		props.season_type = parseField(msg, n.season_type, "season_type");
		props.stat_category = parseField(msg, n.stat_category, "stat_category");
		props.sorter = parseField(msg, n.sorter, "sorter");
		props.p_or_t = parseField(msg, n.player_team, "player_team");
		props.ahead_behind = parseField(msg, n.ahead_behind, "ahead_behind"); 
		props.point_diff = parseField(msg, n.point_diff);
		props.clutch_time = parseField(msg, n.clutch_time, "clutch_time");
		props.measure_type = parseField(msg, n.measure_type, "measure_type");
		props.pt_measure_type = parseField(msg, n.pt_measure_type, "pt_measure_type");
		props.group_quantity = parseField(msg, n.group_quantity, "group_quantity");

		// There are 2 different endpoints for player and team, rather than passing a parameter in 
		if (props.league_type === "shooting") {
			props.league_type = (props.p_or_t === "P") ? "player_shooting" : "team_shooting";
		} else if (props.league_type === "hustle") {
			props.league_type = (props.p_or_t === "P") ? "player_hustle" : "team_hustle";
		} else if (props.league_type === "clutch") {
			props.league_type = (props.p_or_t === "P") ? "player_clutch" : "team_clutch";
		} else if (props.league_type === "player tracking") {
			// This particular endpoint wants "Player"/"Team" instead of "P"/"T" https://github.com/bttmly/nba-client-template/blob/master/nba.json
			props.p_or_t = (props.p_or_t === "P") ? "Player" : "Team";
		}

		return props; 
	}

	function getLeagueParamsDict(props) {
		var params_dict = {
			"scoreboard": {gameDate: props.game_date},
			"leaders": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, StatCategory: props.stat_category},
			"standings": {Season: props.season, SeasonType: props.season_type},
			"game log": {PlayerOrTeam: props.p_or_t, Season: props.season, SeasonType: props.season_type, Sorter: props.sorter},
			"player tracking": {PlayerOrTeam: props.p_or_t, Season: props.season, SeasonType: props.season_type, PtMeasureType: props.pt_measure_type, PerMode: props.per_mode},
			"player_shooting": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
			"team_shooting": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
			"player_hustle": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
			"team_hustle": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode},
			"player_clutch": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, AheadBehind: props.ahead_behind, ClutchTime: props.clutch_time, PointDiff: props.point_diff},
			"team_clutch": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, AheadBehind: props.ahead_behind, ClutchTime: props.clutch_time, PointDiff: props.point_diff},
			"lineups": {Season: props.season, SeasonType: props.season_type, PerMode: props.per_mode, MeasureType: props.measure_type, GroupQuantity: props.group_quantity}
		}
		return params_dict; 
	}

	function getGameMethodDict() {
		var method_dict = {
			"play-by-play": NBA.stats.playByPlay,
			"shot chart": NBA.stats.shots,
			"box score": boxScorePromise
		}
		return method_dict; 
	}

	function getGameProps(n, msg) {
		var props = {}; 
		props.game_type = parseField(msg, n.game_type);
		props.game_id = parseField(msg, n.game_id);
		return props; 
	}

	function getGameParamsDict(props) {
		var params_dict = {
			"play-by-play": {GameID: props.game_id},
			"shot chart": {GameID: props.game_id},
			"box score": {GameID: props.game_id}
		}
		return params_dict; 
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

	function getDatabaseProps(n, msg) {
		var props = {}; 
		props.database_type = parseField(msg, n.database_type);
		props.get_type = parseField(msg, n.get_type, "get_type");
		props.first_name = parseField(msg, n.first_name);
		props.last_name = parseField(msg, n.last_name);
		props.team_name = parseField(msg, n.team_name);
		props.source = n.source;
		props.id = parseInt(parseField(msg, n.object_id));
		return props; 
	}


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
		var id = (props.source === "name") ? parseInt(NBA.findPlayer(props.first_name + " " + props.last_name).playerId) : props.id;
		return playerObjFromID(id);
	}

	function getOneTeam(props) {
		var id = (props.source === "name") ? parseInt(NBA.teamIdFromName(props.team_name)) : props.id;
		return teamObjFromID(id);
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

	function DatabaseNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;

		var method_dict = getDatabaseMethodDict();
		resetNodeStatus(node); 
		node.on('input', function(msg) {
			setLoadingStatus(node, "loading");

			var props = getDatabaseProps(n, msg); 
			var params_dict = getDatabaseParamsDict(props);
			var response = method_dict[props.database_type](params_dict[props.database_type]);

			sendMsg(node, msg, response); 
			setSuccessStatus(node, "complete");			
		});        
	}
	RED.nodes.registerType("database",DatabaseNode);

	function PlayerNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;		

		var method_dict = getPlayerMethodDict();
		resetNodeStatus(node); 
	
		node.on('input', function(msg) {
			var props = getPlayerProps(n, msg); 
			var player_obj = playerObjFromID(props.player_id);
			
			// Send error and bail if player isn't found
			if (!player_obj) {
				node.error("Invalid player id", msg);
				return;
			} 

			var last_name = player_obj.lastName;
			setLoadingStatus(node, last_name); 

			var params_dict = getPlayerParamsDict(props);

			method_dict[props.player_type](params_dict[props.player_type])
				.then (response => { 
					sendMsg(node, msg, response);
					setSuccessStatus(node, last_name);
				}).catch (error => { 
					sendError(node, msg, error);
					setErrorStatus(node); 
				})		

		});        
	}
	RED.nodes.registerType("player",PlayerNode);
	
	function TeamNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;
		
		var method_dict = getTeamMethodDict(); 
		resetNodeStatus(node);

		node.on('input', function(msg) {
			var props = getTeamProps(n, msg);
			var params_dict = getTeamParams(props); 
			var team_obj = teamObjFromID(props.team_id);

			// Send error and bail if team isn't found
			if (!team_obj) {
				node.error("Invalid team id", msg);
				return;
			} 

			var team_name = team_obj.simpleName;
			setLoadingStatus(node, team_name);			

			method_dict[props.team_type](params_dict[props.team_type])
				.then (response => { 
					sendMsg(node, msg, response);
					setSuccessStatus(node, team_name); 
				})
				.catch (error => { 
					sendError(node, msg, error); 
					setErrorStatus(node);  
				})		
		});        
	}
	RED.nodes.registerType("team",TeamNode);

	function LeagueNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;

		var method_dict = getLeagueMethodDict(); 
		resetNodeStatus(node); 

		node.on('input', function(msg) {
			setLoadingStatus(node, "loading");

			var props = getLeagueProps(n, msg);
			var params_dict = getLeagueParamsDict(props); 

			method_dict[props.league_type](params_dict[props.league_type])
				.then (response => { 
					sendMsg(node, msg, cleanData(response));
					var status_msg = (props.league_type === "scoreboard") ? props.game_date : props.season;
					setSuccessStatus(node, status_msg);
				})
				.catch (error => { 
					sendError(node, msg, error);
					setErrorStatus(node); 
				})
		});        
	}
	RED.nodes.registerType("league",LeagueNode);    	

	function GameNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;
		
		var method_dict = getGameMethodDict(); 
		resetNodeStatus(node); 
		
		node.on('input', function(msg) {
			var props = getGameProps(n, msg); 
			var params_dict = getGameParamsDict(props); 
			setLoadingStatus(node, props.game_id); 		

			method_dict[props.game_type](params_dict[props.game_type])
				.then (response => { 
					sendMsg(node, msg, response);
					setSuccessStatus(node, props.game_id);
				})
				.catch (error => { 
					sendError(node, msg, error);
					setErrorStatus(node); 
				})
			 
		});        
	}
	RED.nodes.registerType("game",GameNode);

	RED.httpAdmin.get("/params", function(req,res) {
		res.json({params: NBA_CLIENT.parameters})
    });
}