
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

	function DatabaseNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;

		console.log("TEST LINK");

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

		node.status({});
		node.on('input', function(msg) {
			var player_id = parseInt(parseField(msg, n.player_id));
			var player_obj = playerObjFromID(player_id);
			var last_name;
 
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

			if (player_type === "profile") {				
				NBA.stats.playerInfo({PlayerID: player_id})
					.then(response => { sendMsg({ "commonPlayerInfo": response.commonPlayerInfo[0], "playerHeadlineStats": response.playerHeadlineStats[0] }) })
					.catch(error => {  sendError(error) })
			} else if (player_type === "stats") {
				NBA.stats.playerProfile({PlayerID: player_id})
					.then(response => { 
						// Convert array with one item to an object 
						response.careerTotalsRegularSeason = response.careerTotalsRegularSeason[0];
						response.careerTotalsPostSeason = response.careerTotalsPostSeason[0];
						response.careerTotalsAllStarSeason = response.careerTotalsAllStarSeason[0];
						response.careerTotalsCollegeSeason = response.careerTotalsCollegeSeason[0];
						response.careerTotalsPreseason = response.careerTotalsPreseason[0];
						response.nextGame = response.nextGame[0]; 
						sendMsg(response) 
					})
					.catch(error => { 	sendError(error)})
			} else if (player_type === "shot chart") {
				NBA.stats.shots({PlayerID: player_id, Season: season, SeasonType: season_type})
					.then(response => { sendMsg(response) })
					.catch(error => { sendError(error) })
			} else if (player_type === "splits") {
				NBA.stats.playerSplits({PlayerID: player_id, Season: season, SeasonType: season_type, MeasureType: measure_type})
					.then(response => { 
						response.overallPlayerDashboard = response.overallPlayerDashboard[0];
						sendMsg(response) 
					})
					.catch(error => { sendError(error) 	})
			}

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

			if (team_type === "profile") {				
				NBA.stats.teamInfoCommon({TeamID: team_id})
					.then(response => { sendMsg({ "teamInfoCommon": response.teamInfoCommon[0], "teamSeasonRanks": response.teamSeasonRanks[0] }) })
					.catch(error => {  sendError(error) })
			} else if (team_type === "stats") {
				NBA.stats.teamStats({TeamID: team_id, Season: season, SeasonType: season_type, Outcome: "L"})
					.then(response => { sendMsg(response[0])})
					.catch(error => { 	sendError(error)})
			} else if (team_type === "roster") {
				NBA.stats.commonTeamRoster({TeamID: team_id, Season: season})
					.then(response => { sendMsg(response) })
					.catch(error => { 	sendError(error)})
			} else if (team_type === "lineups") {
				NBA.stats.lineups({TeamID: team_id, Season: season, SeasonType: season_type, PerMode: per_mode, MeasureType: measure_type, GroupQuantity: group_quantity})
					.then(response => { sendMsg(response); })
					.catch(error => { sendError(error) })
			} else if (team_type === "shooting") {
				if (p_or_t === "P") {
					NBA.stats.playerShooting({TeamID: team_id, Season: season, SeasonType: season_type, PerMode: per_mode})
						.then(response => { sendMsg(response.leagueDashPTShots); })
						.catch(error => { sendError(error) })
				} else if (p_or_t === "T") {
					NBA.stats.teamShooting({TeamID: team_id, Season: season, SeasonType: season_type, PerMode: per_mode})
						.then(response => { sendMsg(response.leagueDashPTShots[0]); })
						.catch(error => { sendError(error) })
				}
			} else if (team_type === "splits") {
				NBA.stats.teamSplits({TeamID: team_id, Season: season, SeasonType: season_type, MeasureType: measure_type})
					.then(response => { 
						response.overallTeamDashboard = response.overallTeamDashboard[0]; 
						sendMsg(response);
					})
					.catch(error => { sendError(error) 	})
			} else if (team_type === "shot chart") {
				NBA.stats.shots({TeamID: team_id, Season: season, SeasonType: season_type})
					.then(response => { sendMsg(response) })
					.catch(error => { sendError(error) })
			}

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
			var group_quantity = parseField(msg, n.group_quantity, "group_quantity")


			if (league_type === "scoreboard") {
				NBA.stats.scoreboard({gameDate: game_date})
					.then(response => { sendMsg(response, game_date); })
					.catch(error => { sendError(error) })	
			} else if (league_type === "leaders") {
				NBA.stats.leagueLeaders({Season: season, SeasonType: season_type, PerMode: per_mode, StatCategory: stat_category})
					.then(response => { sendMsg({
						"resource": response.resource, 
						"parameters": response.parameters, 
						"resultSet": convertData(response.resultSet)}, season)
					 })
					.catch(error => { sendError(error); })
			} else if (league_type === "standings") {
				NBA.stats.leagueStandings({Season: season, SeasonType: season_type})
					.then(response => { sendMsg({
						"resource": response.resource, 
						"parameters": response.parameters, 
						"resultSet": convertData(response.resultSets[0])}, season)
					})
					.catch(error => { sendError(error) })
			} else if (league_type === "game log") {
				NBA.stats.leagueGameLog({PlayerOrTeam: p_or_t, Season: season, SeasonType: season_type, Sorter: sorter})
					.then(response => { sendMsg({
						"resource": response.resource, 
						"parameters": response.parameters, 
						"resultSet": convertData(response.resultSets[0])}, season)
					})
					.catch(error => { sendError(error) })
			} else if (league_type === "player tracking") {
				// This particular endpoint wants "Player"/"Team" instead of "P"/"T" https://github.com/bttmly/nba-client-template/blob/master/nba.json
				var player_or_team = (p_or_t === "P") ? "Player" : "Team";
				NBA.stats.playerTracking({PlayerOrTeam: player_or_team, Season: season, SeasonType: season_type, PtMeasureType: pt_measure_type, PerMode: per_mode})
					.then(response => { sendMsg(response.leagueDashPtStats, season) })
					.catch(error => { sendError(error) })
			} else if (league_type === "shooting") {
				if (p_or_t === "P") {
					NBA.stats.playerShooting({Season: season, SeasonType: season_type, PerMode: per_mode})
						.then(response => { sendMsg(response.leagueDashPTShots, season); })
						.catch(error => { sendError(error) })
				} else if (p_or_t === "T") {
					NBA.stats.teamShooting({Season: season, SeasonType: season_type, PerMode: per_mode})
						.then(response => { sendMsg(response.leagueDashPTShots, season); })
						.catch(error => { sendError(error) })
				}
			} else if (league_type === "hustle") {
				if (p_or_t === "P") {
					NBA.stats.playerHustle({Season: season, SeasonType: season_type, PerMode: per_mode})
						.then(response => { sendMsg({
							"resource": response.resource, 
							"parameters": response.parameters, 
							"resultSet": convertData(response.resultSets[0])}, season)
						})
						.catch(error => { sendError(error) })
				} else if (p_or_t === "T") {
					NBA.stats.teamHustle({Season: season, SeasonType: season_type, PerMode: per_mode})
						.then(response => { sendMsg({
							"resource": response.resource, 
							"parameters": response.parameters, 
							"resultSet": convertData(response.resultSets[0])}, season)
						})
						.catch(error => { sendError(error) })
				}
			} else if (league_type === "clutch") {
				if (p_or_t === "P") {
					NBA.stats.playerClutch({Season: season, SeasonType: season_type, PerMode: per_mode, AheadBehind: ahead_behind, ClutchTime: clutch_time, PointDiff: point_diff})
						.then(response => { sendMsg(response.leagueDashPlayerClutch, season); })
						.catch(error => { sendError(error) })
				} else if (p_or_t === "T") {
					NBA.stats.teamClutch({Season: season, SeasonType: season_type, PerMode: per_mode, AheadBehind: ahead_behind, ClutchTime: clutch_time, PointDiff: point_diff})
						.then(response => { sendMsg(response.leagueDashTeamClutch, season); })
						.catch(error => { sendError(error) })
				}
			} else if (league_type === "lineups") {
				NBA.stats.lineups({Season: season, SeasonType: season_type, PerMode: per_mode, MeasureType: measure_type, GroupQuantity: group_quantity})
					.then(response => { sendMsg(response, season); })
					.catch(error => { sendError(error) })
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
	RED.nodes.registerType("league",LeagueNode);    	

	function GameNode(n) {
		RED.nodes.createNode(this,n);
        var node = this;

		node.status({});
		node.on('input', function(msg) {
			var game_type = parseField(msg, n.game_type);
			var game_id = parseField(msg, n.game_id);

			node.status({fill:"blue",shape:"dot",text:game_id});

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
			} else if (game_type === "play-by-play") {
				NBA.stats.playByPlay({GameID: game_id})
					.then(response => { sendMsg(response) })
					.catch(error => { 	sendError(error)})
			} else if (game_type === "shot chart") {
				NBA.stats.shots({GameID: game_id})
					.then(response => { sendMsg(response) })
					.catch(error => { sendError(error) })
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