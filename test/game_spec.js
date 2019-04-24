
var should = require("should");
var helper = require("node-red-node-test-helper");
var nbaNode = require("../nba.js")

helper.init(require.resolve('node-red'));

console.log("It is recommended to comment line 4 'NBA.updatePlayers()' out of ../nba.js or else the tests will hit a rate limit");

describe('Game node: ', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    }); 

      
      it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "game", name: "game" }];
        helper.load(nbaNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'game');
          done();
        });
      });

      it('game box score', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "box score", game_id: "0021801177", live: "false"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("gameSummary");
                msg.payload.should.have.property("otherStats");
                msg.payload.should.have.property("officials");
                msg.payload.should.have.property("inactivePlayers");
                msg.payload.should.have.property("gameInfo");
                msg.payload.should.have.property("lineScore");
                msg.payload.should.have.property("lastMeeting");
                msg.payload.should.have.property("seasonSeries");
                msg.payload.should.have.property("availableVideo");
                msg.payload.should.have.property("playerStats");
                msg.payload.should.have.property("teamStats");
                msg.payload.should.have.property("starterBenchStats");
                done();
          });
          n1.receive({ payload: "" });
        });
      });  
      
      it('game box score live', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "box score", game_id: "0021801177", live: "true", game_date: "2019-04-04"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("sports_content");
                msg.payload.sports_content.should.have.property("sports_meta");
                msg.payload.sports_content.should.have.property("game");
                msg.payload.sports_content.game.should.have.property("id", "0021801177");
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('(node) load live from msg.live', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "box score", game_id: "0021801177", live: "dynamic", game_date: "2019-04-04"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("sports_content");
                msg.payload.sports_content.should.have.property("sports_meta");
                msg.payload.sports_content.should.have.property("game");
                msg.payload.sports_content.game.should.have.property("id", "0021801177");
                done();
          });
          n1.receive({ payload: "", live: "true" });
        });
      });

      it('game play-by-play', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "play-by-play", game_id: "0021801177", live: "false"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("playByPlay");
                msg.payload.should.have.property("availableVideo");
                msg.payload.playByPlay[0].should.have.property("gameId", "0021801177");
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('game play-by-play live', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "play-by-play", game_id: "0021801177", live: "true", game_date: "2019-04-04"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("sports_content");
                msg.payload.sports_content.should.have.property("sports_meta");
                msg.payload.sports_content.should.have.property("game");
                msg.payload.sports_content.game.should.have.property("id", "0021801177");
                msg.payload.sports_content.game.should.have.property("play");
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('game shot chart', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "shot chart", game_id: "0021801177"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("shot_Chart_Detail");
                msg.payload.should.have.property("leagueAverages");
                msg.payload.shot_Chart_Detail[0].should.have.property("gameId", "0021801177");
                done();
          });
          n1.receive({ payload: "" });
        });
      });


      it('(node) game_id mustache', function (done) {
        var flow = [
          { id: "n1", type: "game", name: "get",wires:[["n2"]], game_type: "box score", game_id: "{{payload}}"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("gameSummary");
                msg.payload.should.have.property("otherStats");
                msg.payload.should.have.property("officials");
                msg.payload.should.have.property("inactivePlayers");
                msg.payload.should.have.property("gameInfo");
                msg.payload.should.have.property("lineScore");
                msg.payload.should.have.property("lastMeeting");
                msg.payload.should.have.property("seasonSeries");
                msg.payload.should.have.property("availableVideo");
                msg.payload.should.have.property("playerStats");
                msg.payload.should.have.property("teamStats");
                msg.payload.should.have.property("starterBenchStats");

                done();
          });
          n1.receive({ payload: "0021801177" });
        });
      });  
      
      

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });
});


