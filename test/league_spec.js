
var should = require("should");
var helper = require("node-red-node-test-helper");
var nbaNode = require("../nba.js")

helper.init(require.resolve('node-red'));

console.log("It is recommended to comment line 4 'NBA.updatePlayers()' out of ../nba.js or else the tests will hit a rate limit");

describe('League node: ', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });
  
    
      it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "league", name: "league" }];
        helper.load(nbaNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'league');
          done();
        });
      });

      it('league scoreboard', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "scoreboard", game_date: "2019-04-03"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("gameHeader");
            msg.payload.should.have.property("lineScore");
            msg.payload.should.have.property("seriesStandings");
            msg.payload.should.have.property("lastMeeting");
            msg.payload.should.have.property("eastConfStandingsByDay");
            msg.payload.should.have.property("westConfStandingsByDay");
            msg.payload.should.have.property("available");
            done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('(node) game_date mustache', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "scoreboard", game_date: "{{payload}}"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("gameHeader");
            msg.payload.should.have.property("lineScore");
            msg.payload.should.have.property("seriesStandings");
            msg.payload.should.have.property("lastMeeting");
            msg.payload.should.have.property("eastConfStandingsByDay");
            msg.payload.should.have.property("westConfStandingsByDay");
            msg.payload.should.have.property("available");
            done();
          });
          n1.receive({ payload: "2019-04-03" });
        });
      });

      it('league leaders', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "leaders", season_type: "Regular Season", per_mode: "PerGame", stat_category: "PTS", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leagueleaders");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSet");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('(node) season_type load from msg.season_type', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "leaders", season_type: "dynamic", per_mode: "PerGame", stat_category: "PTS", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leagueleaders");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSet");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "", season_type: "Regular Season" });
        });
      });

      it('(node) per_mode load from msg.per_mode', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "leaders", season_type: "Regular Season", per_mode: "dynamic", stat_category: "PTS", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leagueleaders");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSet");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "", per_mode: "PerGame" });
        });
      });

      it('(node) stat_category load from msg.stat_category', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "leaders", season_type: "Regular Season", per_mode: "PerGame", stat_category: "dynamic", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leagueleaders");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSet");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "", stat_category: "PTS" });
        });
      });

      it('(node) season load from msg.season', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "leaders", season_type: "Regular Season", per_mode: "PerGame", stat_category: "PTS", season: "dynamic"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leagueleaders");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSet");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "", season: "2018-19" });
        });
      });

      it('league standings', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "standings", season_type: "Regular Season", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leaguestandings");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSets");
            msg.payload.resultSets[0].should.have.property("name", "Standings");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("TeamID");
            done();
          });
          n1.receive({ payload: "2018-19" });
        });
      });

    it('league game log by player', function (done) {
      var flow = [
        { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "game log", season_type: "Regular Season", season: "2018-19", sorter: "PTS", player_team: "P"},
        { id: "n2", type: "helper" }
      ];
      helper.load(nbaNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        n2.on("input", function (msg) {
          msg.should.have.property("payload");
          msg.payload.should.have.property("resource", "leaguegamelog");
          msg.payload.should.have.property("parameters");
          msg.payload.should.have.property("resultSets");
          msg.payload.resultSets[0].should.have.property("name", "LeagueGameLog");
          msg.payload.should.have.property("cleanedData");
          msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
          done();
        });
        n1.receive({ payload: "2018-19" });
      });
    });

    it('(node) sorter load from msg.sorter', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "game log", season_type: "Regular Season", season: "2018-19", sorter: "dynamic", player_team: "P"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leaguegamelog");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSets");
            msg.payload.resultSets[0].should.have.property("name", "LeagueGameLog");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "2018-19", sorter: "PTS" });
        });
      });

      it('league game log by team', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "game log", season_type: "Regular Season", season: "2018-19", sorter: "PTS", player_team: "T"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("resource", "leaguegamelog");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSets");
            msg.payload.resultSets[0].should.have.property("name", "LeagueGameLog");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("TEAM_ID");
            done();
          });
          n1.receive({ payload: "2018-19" });
        });
      });

    it('league player tracking by player', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "player tracking", season_type: "Regular Season", per_mode: "PerGame", pt_measure_type: "CatchShoot", season: "2018-19",  player_team: "P"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPtStats");
            msg.payload.leagueDashPtStats[0].should.have.property("playerId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('league player tracking by team', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "player tracking", season_type: "Regular Season", per_mode: "PerGame", pt_measure_type: "CatchShoot", season: "2018-19",  player_team: "T"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPtStats");
            msg.payload.leagueDashPtStats[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('(node) pt_measure_type load from msg.pt_measure_type', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "player tracking", season_type: "Regular Season", per_mode: "PerGame", pt_measure_type: "dynamic", season: "2018-19",  player_team: "T"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPtStats");
            msg.payload.leagueDashPtStats[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19", pt_measure_type: "CatchShoot"});
        });
      });

    it('league shooting by player', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "shooting", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "P"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPTShots");
            msg.payload.leagueDashPTShots[0].should.have.property("playerId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

      it('(node) player_team load from msg.player_team', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "shooting", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "dynamic"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPTShots");
            msg.payload.leagueDashPTShots[0].should.have.property("playerId");
            done();
          });
          n1.receive({ payload: "2018-19", player_team: "P"});
        });
      });

    it('league shooting by team', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "shooting", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "T"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPTShots");
            msg.payload.leagueDashPTShots[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('league hustle by player', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "hustle", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "P"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.payload.should.have.property("resource", "leaguehustlestatsplayer");
            msg.payload.should.have.property("parameters");
            msg.payload.should.have.property("resultSets");
            msg.payload.resultSets[0].should.have.property("name", "HustleStatsPlayer");
            msg.payload.should.have.property("cleanedData");
            msg.payload.cleanedData[0].should.have.property("PLAYER_ID");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('league hustle by team', function (done) {
      var flow = [
        { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "hustle", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "T"},
        { id: "n2", type: "helper" }
      ];
      helper.load(nbaNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        n2.on("input", function (msg) {
          msg.payload.should.have.property("resource", "leaguehustlestatsteam");
          msg.payload.should.have.property("parameters");
          msg.payload.should.have.property("resultSets");
          msg.payload.resultSets[0].should.have.property("name", "HustleStatsTeam");
          msg.payload.should.have.property("cleanedData");
          msg.payload.cleanedData[0].should.have.property("TEAM_ID");
          done();
        });
        n1.receive({ payload: "2018-19"});
      });
    });

    it('league clutch by player', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "clutch", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "P", ahead_behind: "Ahead or Behind", clutch_time: "Last 5 Minutes", point_diff: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPlayerClutch");
            msg.payload.leagueDashPlayerClutch[0].should.have.property("playerId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('league clutch by team', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "clutch", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "T", ahead_behind: "Ahead or Behind", clutch_time: "Last 5 Minutes", point_diff: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashTeamClutch");
            msg.payload.leagueDashTeamClutch[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('(node) ahead_behind load from msg.ahead_behind', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "clutch", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "P", ahead_behind: "dynamic", clutch_time: "Last 5 Minutes", point_diff: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPlayerClutch");
            msg.payload.leagueDashPlayerClutch[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19", ahead_behind: "Ahead or Behind"});
        });
      });

      it('(node) clutch_time load from msg.clutch_time', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "clutch", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "P", ahead_behind: "Ahead or Behind", clutch_time: "dynamic", point_diff: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPlayerClutch");
            msg.payload.leagueDashPlayerClutch[0].should.have.property("playerId");
            done();
          });
          n1.receive({ payload: "2018-19", clutch_time: "Last 5 Minutes"});
        });
      });

      it('(node) point_diff mustache', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "clutch", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  player_team: "P", ahead_behind: "Ahead or Behind", clutch_time: "Last 5 Minutes", point_diff: "{{payload}}"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPlayerClutch");
            msg.payload.leagueDashPlayerClutch[0].should.have.property("playerId");
            done();
          });
          n1.receive({ payload: "5"});
        });
      });

    it('league lineups', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "lineups", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  measure_type: "Base", group_quantity: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("groupId");
            msg.payload[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19"});
        });
      });

    it('(node) measure_type load from msg.measure_type', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "lineups", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  measure_type: "dynamic", group_quantity: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("groupId");
            msg.payload[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19", measure_type: "Base"});
        });
      });

    it('(node) group_quantity load from msg.group_quantity', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "lineups", season_type: "Regular Season", per_mode: "PerGame",  season: "2018-19",  measure_type: "Base", group_quantity: "dynamic"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("groupId");
            msg.payload[0].should.have.property("teamId");
            done();
          });
          n1.receive({ payload: "2018-19", group_quantity: "5"});
        });
      });    

      it('league schedule', function (done) {
        var flow = [
          { id: "n1", type: "league", name: "league", wires:[["n2"]], league_type: "schedule", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("lscd");
            msg.payload.lscd[0].should.have.property("mscd")
            msg.payload.lscd[0].mscd.should.have.property("g")
            msg.payload.lscd[0].mscd.g[0].should.have.property("gid")
            done();
          });
          n1.receive({ payload: ""});
        });
      });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });
});


