
var should = require("should");
var helper = require("node-red-node-test-helper");
var nbaNode = require("../nba.js")

helper.init(require.resolve('node-red'));

console.log("It is recommended to comment line 4 'NBA.updatePlayers()' out of ../nba.js or else the tests will hit a rate limit");


describe('Team node: ', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });
  
    
      it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "team", name: "team" }];
        helper.load(nbaNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'team');
          done();
        });
      });

      it('team profile', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "profile", team_id: "1610612752"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("teamInfoCommon");
            msg.payload.should.have.property("teamSeasonRanks");
            done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('(node) team_id mustache', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "profile", team_id: "{{payload}}"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("teamInfoCommon");
            msg.payload.should.have.property("teamSeasonRanks");
            done();
          });
          n1.receive({ payload: "1610612752" });
        });
      });

      it('team stats', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "stats", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("teamId", 1610612752);
            done();
          });
          n1.receive({ payload: "1610612752" });
        });
      });

      it('(node) season_type load from msg.season_type', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "stats", team_id: "1610612752", season_type: "dynamic", per_mode: "PerGame", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("teamId", 1610612752);
            done();
          });
          n1.receive({ payload: "1610612752", season_type: "Regular Season" });
        });
      });

      it('(node) per_mode load from msg.per_mode', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "stats", team_id: "1610612752", season_type: "Regular Season", per_mode: "dynamic", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("teamId", 1610612752);
            done();
          });
          n1.receive({ payload: "1610612752", per_mode: "PerGame" });
        });
      });

      it('(node) season load from msg.season', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "stats", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "dynamic"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("teamId", 1610612752);
            done();
          });
          n1.receive({ payload: "", season: "2018-19" });
        });
      });

      it('team shooting by player', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "shooting", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", player_team: "P"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPTShots");
            msg.payload.leagueDashPTShots[0].should.have.property("playerId");
            msg.payload.leagueDashPTShots[0].should.have.property("fgm");
            done();
          });
          n1.receive({ payload: ""});
        });
      });

      it('team shooting by team', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "shooting", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", player_team: "T"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPTShots");
            msg.payload.leagueDashPTShots[0].should.have.property("teamId", 1610612752);
            msg.payload.leagueDashPTShots[0].should.have.property("fgm");
            done();
          });
          n1.receive({ payload: ""});
        });
      });

      it('(node) player_team load from msg.player_team', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "shooting", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", player_team: "dynamic"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("leagueDashPTShots");
            msg.payload.leagueDashPTShots[0].should.have.property("teamId", 1610612752);
            msg.payload.leagueDashPTShots[0].should.have.property("fgm");
            done();
          });
          n1.receive({ payload: "", player_team: "T"});
        });
      });
      
      it('team splits', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "splits", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", measure_type: "Base"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("overallTeamDashboard");
            msg.payload.should.have.property("locationTeamDashboard");
            msg.payload.should.have.property("winsLossesTeamDashboard");
            msg.payload.should.have.property("monthTeamDashboard");
            msg.payload.should.have.property("prePostAllStarTeamDashboard");
            msg.payload.should.have.property("daysRestTeamDashboard");
            done();
          });
          n1.receive({ payload: ""});
        });
      });

      it('(node) measure_type load from msg.measure_type', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "splits", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", measure_type: "dynamic"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("overallTeamDashboard");
            msg.payload.should.have.property("locationTeamDashboard");
            msg.payload.should.have.property("winsLossesTeamDashboard");
            msg.payload.should.have.property("monthTeamDashboard");
            msg.payload.should.have.property("prePostAllStarTeamDashboard");
            msg.payload.should.have.property("daysRestTeamDashboard");
            done();
          });
          n1.receive({ payload: "", measure_type: "Base"});
        });
      });

      it('team roster', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "roster", team_id: "1610612752", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("commonTeamRoster");
            msg.payload.should.have.property("coaches");
            done();
          });
          n1.receive({ payload: ""});
        });
      });

      it('team lineups', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "lineups", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", measure_type: "Base", group_quantity: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("groupId");
            msg.payload[0].should.have.property("teamId", 1610612752);
            done();
          });
          n1.receive({ payload: "", measure_type: "Base"});
        });
      });

      it('(node) group_quantity load from msg.group_quantity', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "lineups", team_id: "1610612752", season_type: "Regular Season", per_mode: "PerGame", season: "2018-19", measure_type: "Base", group_quantity: "5"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("groupId");
            msg.payload[0].should.have.property("teamId", 1610612752);
            done();
          });
          n1.receive({ payload: "", group_quantity: 5});
        });
      });

      it('team shot chart', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "shot chart", team_id: "1610612752", season_type: "Regular Season", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("shot_Chart_Detail");
            msg.payload.should.have.property("leagueAverages");
            done();
          });
          n1.receive({ payload: ""});
        });
      });

      it('team schedule', function (done) {
        var flow = [
          { id: "n1", type: "team", name: "team", wires:[["n2"]], team_type: "schedule", team_id: "1610612752", season: "2018-19"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload[0].should.have.property("gid");
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


