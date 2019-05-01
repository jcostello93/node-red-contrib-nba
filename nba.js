module.exports = function(RED) {
    "use strict";
	var NBA = require("nba");
	// NBA.updatePlayers();
	var NBA_CLIENT = require("nba-client-template");	
	var league_util = require("./utils/league.js");
	var player_util = require("./utils/player.js");
	var team_util = require("./utils/team.js");
	var game_util = require("./utils/game.js");
	var database_util = require("./utils/database.js");
	var nba_helper = require("./utils/nba_helper.js");
	var node_helper = require("./utils/node_helper.js");

	var playerObjFromID = nba_helper.playerObjFromID; 
	var teamObjFromID = nba_helper.teamObjFromID; 
	var cleanData = nba_helper.cleanData;
	var addMissingParamDefaultValues = nba_helper.addMissingParamDefaultValues;

	var resetNodeStatus = node_helper.resetNodeStatus; 
	var setLoadingStatus = node_helper.setLoadingStatus; 
	var setSuccessStatus = node_helper.setSuccessStatus; 
	var setErrorStatus = node_helper.setErrorStatus; 
	var sendMsg = node_helper.sendMsg; 
	var sendError = node_helper.sendError; 

	// Dynamically load parameters from nba-client-template in nodes
	addMissingParamDefaultValues(); 
	RED.httpAdmin.get("/params", function(req,res) {
		res.json({params: NBA_CLIENT.parameters})
    });

	function DatabaseNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;

		var method_dict = database_util.getDatabaseMethodDict();
		resetNodeStatus(node); 

		node.on('input', function(msg) {
			setLoadingStatus(node, "loading");

			var props = database_util.getDatabaseProps(n, msg); 
			var params_dict = database_util.getDatabaseParamsDict(props);
			var response = method_dict[props.database_type](params_dict[props.database_type]);

			sendMsg(node, msg, response); 
			setSuccessStatus(node, "complete");			
		});        
	}
	RED.nodes.registerType("database",DatabaseNode);

	function PlayerNode(n) {
		RED.nodes.createNode(this,n);
		var node = this;		

		var method_dict = player_util.getPlayerMethodDict();
		resetNodeStatus(node); 
	
		node.on('input', function(msg) {
			var props = player_util.getPlayerProps(n, msg); 
			var player_obj = playerObjFromID(props.player_id);
			
			// Send error and bail if player isn't found
			if (!player_obj) {
				node.error("Invalid player id", msg);
				return;
			} 

			var last_name = player_obj.lastName;
			setLoadingStatus(node, last_name); 

			var params_dict = player_util.getPlayerParamsDict(props);

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
		
		var method_dict = team_util.getTeamMethodDict(); 
		resetNodeStatus(node);

		node.on('input', function(msg) {
			var props = team_util.getTeamProps(n, msg);
			var params_dict = team_util.getTeamParams(props); 
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

		var method_dict = league_util.getLeagueMethodDict(); 
		resetNodeStatus(node); 

		node.on('input', function(msg) {
			setLoadingStatus(node, "loading");

			var props = league_util.getLeagueProps(n, msg);
			var params_dict = league_util.getLeagueParamsDict(props); 			

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
		
		var method_dict = game_util.getGameMethodDict(); 
		resetNodeStatus(node); 
		
		node.on('input', function(msg) {
			var props = game_util.getGameProps(n, msg); 
			var params_dict = game_util.getGameParamsDict(props); 
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
}