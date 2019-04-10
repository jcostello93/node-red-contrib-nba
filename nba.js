
module.exports = function(RED) {
    "use strict";
	var NBA = require("nba");
	//NBA.updatePlayers();
	var mustache = require("mustache");
	var NBA_CLIENT = require("nba-client-template");

	// In order of priority: 1. HTML text OR mustache syntax, 2. msg.msgProp 
	function parseField(msg, nodeProp, msgProp) {
		var field = null;
		var isTemplatedField = (nodeProp||"").indexOf("{{") != -1
		if (isTemplatedField) {
			field = mustache.render(nodeProp,msg);
		}
		else {
			field = (nodeProp === "dynamic") ? msg[msgProp] : nodeProp;
		}

		return field;
	}

	function playerObjFromID(player_id) {
		return NBA.players.find(player => player.playerId === player_id);
	}

	function teamObjFromID(team_id) {
		return NBA.teams.find(team => team.teamId === team_id);
	}

	// This function takes an object with a header array and a 2D data array and maps them to an array of objects
	// Ex paramters: obj.headers = [PTS, MIN]
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

	function DatabaseNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;

		node.status({});
		node.on('input', function(msg) {
			node.status({fill:"blue",shape:"dot",text:"loading"});

			var database_type = parseField(msg, n.database_type);
			var get_type = parseField(msg, n.get_type, "get_type");
			var first_name = parseField(msg, n.first_name);
			var last_name = parseField(msg, n.last_name);
			var team_name = parseField(msg, n.team_name);
			var source = n.source;
			var id = parseInt(parseField(msg, n.object_id));
		

			if (database_type === "update") {
				// Need to test the error handling here
				try {
					NBA.updatePlayers();
					sendMsg("complete", "complete");
				} catch (err) {
					sendError(err, msg); 
				}
			} else if (database_type === "get data") {
				if (get_type === "all players") {
					sendMsg(NBA.players, NBA.players.length + " players");
				} else if (get_type === "all teams") {
					sendMsg(NBA.teams, NBA.teams.length + " teams");
				} else if (get_type === "one player") {
					if (source === "name") {
						sendMsg(NBA.findPlayer(first_name + " " + last_name), last_name)
					} else if (source === "id") {
						sendMsg(playerObjFromID(id), last_name);
					}
				} else if (get_type === "one team") {
					if (source === "name") {
						id = parseInt(NBA.teamIdFromName(team_name));
					}
	
					var teamObj = teamObjFromID(id);
					sendMsg(teamObj, teamObj.simpleName);								 
				}
			}			

			function sendMsg(payload, statusMsg) {
				msg.payload = payload;
				node.send(msg);
				node.status({fill:"green",shape:"dot",text:statusMsg});
			}

			function sendError(error) {
				node.error(error, msg);
				node.status({fill:"red",shape:"dot",text:"error"});
			}
		});        
	}
	RED.nodes.registerType("database",DatabaseNode);

	function PlayerNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;
		
		var method_dict = {
			"profile": NBA.stats.playerInfo,
			"stats": NBA.stats.playerProfile,
			"shot chart": NBA.stats.shots,
			"splits": NBA.stats.playerSplits
		}

		node.status({});
		node.on('input', function(msg) {
			var player_id = parseInt(parseField(msg, n.player_id));
			var player_obj = playerObjFromID(player_id);
			var last_name;
 
			// Send error and bail if player isn't found
			if (player_obj) {
				last_name = player_obj.lastName;
			} else {
				node.error("Invalid player id", msg);
				return;
			}
			node.status({fill:"blue",shape:"dot",text:last_name});

			
			var player_type = n.player_type;
			var season = parseField(msg, n.season, "season");
			var season_type = parseField(msg, n.season_type, "season_type");
			var measure_type = parseField(msg, n.measure_type, "measure_type");

			var params_dict = {
				"profile": {PlayerID: player_id},
				"stats": {PlayerID: player_id},
				"shot chart": {PlayerID: player_id, Season: season, SeasonType: season_type},
				"splits": {PlayerID: player_id, Season: season, SeasonType: season_type, MeasureType: measure_type}
			}

			method_dict[player_type](params_dict[player_type])
				.then (response => { sendMsg(response) })
				.catch (error => { sendError(error) })

			function sendMsg(payload) {
				msg.payload = payload;
				node.send(msg);
				node.status({fill:"green",shape:"dot",text:last_name});
			}

			function sendError(error) {
				node.error(error, msg);
				node.status({fill:"red",shape:"dot",text:"error"});
			}

		});        
	}
	RED.nodes.registerType("player",PlayerNode);
	
	function TeamNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;
		
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

		node.status({});
		node.on('input', function(msg) {
			var team_id = parseInt(parseField(msg, n.team_id));
			var team_obj = teamObjFromID(team_id);
			var team_name = team_obj.simpleName;
			var per_mode = parseField(msg, n.per_mode, "per_mode");
			var measure_type = parseField(msg, n.measure_type, "measure_type");
			var group_quantity = parseField(msg, n.group_quantity, "group_quantity");
			var p_or_t = parseField(msg, n.player_team, "player_team");			
			var team_type = parseField(msg, n.team_type);
			var season = parseField(msg, n.season, "season");
			var season_type = parseField(msg, n.season_type, "season_type");
			node.status({fill:"blue",shape:"dot",text: team_name});

			if (team_type === "shooting") {
				team_type = (p_or_t === "P") ? "player_shooting" : "team_shooting";
			}

			var params_dict = {
				"profile": {TeamID: team_id},
				"stats": {TeamID: team_id, Season: season, SeasonType: season_type},
				"roster": {TeamID: team_id, Season: season},
				"lineups": {TeamID: team_id, Season: season, SeasonType: season_type, PerMode: per_mode, MeasureType: measure_type, GroupQuantity: group_quantity},
				"player_shooting": {TeamID: team_id, Season: season, SeasonType: season_type, PerMode: per_mode},
				"team_shooting": {TeamID: team_id, Season: season, SeasonType: season_type, PerMode: per_mode},
				"splits": {TeamID: team_id, Season: season, SeasonType: season_type, MeasureType: measure_type},
				"shot chart": {TeamID: team_id, Season: season, SeasonType: season_type}
			}

			method_dict[team_type](params_dict[team_type])
				.then (response => { sendMsg(response) })
				.catch (error => { sendError(error) })		

			function sendMsg(payload) {
				msg.payload = payload;
				node.send(msg);
				node.status({fill:"green",shape:"dot",text:team_name});
			}

			function sendError(error) {
				node.error(error, msg);
				node.status({fill:"red",shape:"dot",text:"error"});
			}
		});        
	}
	RED.nodes.registerType("team",TeamNode);

	function LeagueNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;

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

		node.status({});
		node.on('input', function(msg) {
			node.status({fill:"blue",shape:"dot",text:"loading"});

			var league_type = n.league_type;
			var game_date = parseField(msg, n.game_date);	
			var per_mode = parseField(msg, n.per_mode, "per_mode");
			var season = parseField(msg, n.season, "season");
			var season_type = parseField(msg, n.season_type, "season_type");
			var stat_category = parseField(msg, n.stat_category, "stat_category");
			var sorter = parseField(msg, n.sorter, "sorter");
			var p_or_t = parseField(msg, n.player_team, "player_team");
			var ahead_behind = parseField(msg, n.ahead_behind, "ahead_behind"); 
			var point_diff = parseField(msg, n.point_diff);
			var clutch_time = parseField(msg, n.clutch_time, "clutch_time");
			var measure_type = parseField(msg, n.measure_type, "measure_type");
			var pt_measure_type = parseField(msg, n.pt_measure_type, "pt_measure_type");
			var group_quantity = parseField(msg, n.group_quantity, "group_quantity");

			if (league_type === "shooting") {
				league_type = (p_or_t === "P") ? "player_shooting" : "team_shooting";
			} else if (league_type === "hustle") {
				league_type = (p_or_t === "P") ? "player_hustle" : "team_hustle";
			} else if (league_type === "clutch") {
				league_type = (p_or_t === "P") ? "player_clutch" : "team_clutch";
			} else if (league_type === "player tracking") {
				// This particular endpoint wants "Player"/"Team" instead of "P"/"T" https://github.com/bttmly/nba-client-template/blob/master/nba.json
				p_or_t = (p_or_t === "P") ? "Player" : "Team";
			}

			var params_dict = {
				"scoreboard": {gameDate: game_date},
				"leaders": {Season: season, SeasonType: season_type, PerMode: per_mode, StatCategory: stat_category},
				"standings": {Season: season, SeasonType: season_type},
				"game log": {PlayerOrTeam: p_or_t, Season: season, SeasonType: season_type, Sorter: sorter},
				"player tracking": {PlayerOrTeam: p_or_t, Season: season, SeasonType: season_type, PtMeasureType: pt_measure_type, PerMode: per_mode},
				"player_shooting": {Season: season, SeasonType: season_type, PerMode: per_mode},
				"team_shooting": {Season: season, SeasonType: season_type, PerMode: per_mode},
				"player_hustle": {Season: season, SeasonType: season_type, PerMode: per_mode},
				"team_hustle": {Season: season, SeasonType: season_type, PerMode: per_mode},
				"player_clutch": {Season: season, SeasonType: season_type, PerMode: per_mode, AheadBehind: ahead_behind, ClutchTime: clutch_time, PointDiff: point_diff},
				"team_clutch": {Season: season, SeasonType: season_type, PerMode: per_mode, AheadBehind: ahead_behind, ClutchTime: clutch_time, PointDiff: point_diff},
				"lineups": {Season: season, SeasonType: season_type, PerMode: per_mode, MeasureType: measure_type, GroupQuantity: group_quantity}
			}

			method_dict[league_type](params_dict[league_type])
				.then (response => { sendMsg(cleanData(response)) })
				.catch (error => { sendError(error) })

			function sendMsg(payload) {
				var status_msg = (league_type === "scoreboard") ? game_date : season;
				msg.payload = payload;
				node.send(msg);
				node.status({fill:"green",shape:"dot",text:status_msg});
			}

			function sendError(error) {
				node.error(error, msg);
				node.status({fill:"red",shape:"dot",text:"error"});
			}

		});        
	}
	RED.nodes.registerType("league",LeagueNode);    	

	function GameNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;
		
		var method_dict = {
			"play-by-play": NBA.stats.playByPlay,
			"shot chart": NBA.stats.shots,
		}

		node.status({});
		node.on('input', function(msg) {
			var game_type = parseField(msg, n.game_type);
			var game_id = parseField(msg, n.game_id);

			node.status({fill:"blue",shape:"dot",text:game_id});

			var params_dict = {
				"play-by-play": {GameID: game_id},
				"shot chart": {GameID: game_id},
			}


			// Calls 2 endpoints to get complete box score data
			if (game_type === "box score") {		
				var payload = {};		
				var callback_count = 0;
				NBA.stats.boxScore({GameID: game_id})
					.then(response => { 
						payload.playerStats = convertData(response.resultSets[0])
						payload.teamStats = convertData(response.resultSets[1])
						payload.starterBenchStats = convertData(response.resultSets[2])
						complete(); 
					})
					.catch(error => {  sendError(error) })
				NBA.stats.boxScoreSummary({GameID: game_id})
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
					.catch(error => {  sendError(error) })
				

				// Wait for both calls to complete
				function complete() {
					callback_count++; 
					if (callback_count >= 2) {
						sendMsg(payload);
					}
				}
			 } else {
				method_dict[game_type](params_dict[game_type])
					.then (response => { sendMsg(response) })
					.catch (error => { sendError(error) })
			 }			

			function sendMsg(payload) {
				msg.payload = payload;
				node.send(msg);
				node.status({fill:"green",shape:"dot",text:game_id});
			}

			function sendError(error) {
				node.error(error, msg);
				node.status({fill:"red",shape:"dot",text:"error"});
			}

		});        
	}
	RED.nodes.registerType("game",GameNode);

	RED.httpAdmin.get("/params", function(req,res) {
		res.json({params: NBA_CLIENT.parameters})
    });
}