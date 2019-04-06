
var should = require("should");
var helper = require("node-red-node-test-helper");
var nbaNode = require("../nba.js")

helper.init(require.resolve('node-red'));

describe('Player node: ', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });
  
    
      it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "player", name: "get players" }];
        helper.load(nbaNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'get players');
          done();
        });
      });

      it('player profile (hardcoded)', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "profile", player_id: "201939"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("commonPlayerInfo");
            msg.payload.should.have.property("playerHeadlineStats");
            done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('(node) player_id mustache syntax', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "profile", player_id: "{{payload}}"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("commonPlayerInfo");
            msg.payload.should.have.property("playerHeadlineStats");
            done();
          });
          n1.receive({ payload: "201939" });
        });
      });

      it('(node) invalid player_id', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "profile", player_id: "adkfg"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n1 = helper.getNode("n1");
          var n2 = helper.getNode("n2");
          n1.receive({ payload: "" });
          try {
            var logEvents = helper.log().args.filter(function (evt) {
                return evt[0].type == "player";
            });
            var msg = logEvents[0][0]; 
            msg.should.have.property('level', helper.log().ERROR);
            msg.should.have.property('id', 'n1');
            msg.should.have.property('type', 'player');
            msg.should.have.property('msg', 'Invalid player id');
            done(); 
            
          } catch (err) {
            done(err);
          }
        });
      });

      it('player stats', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "stats", player_id: "201939"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
            msg.should.have.property("payload");
            msg.payload.should.have.property("seasonTotalsRegularSeason");
            msg.payload.should.have.property("careerTotalsRegularSeason");
            msg.payload.should.have.property("seasonTotalsPostSeason");
            msg.payload.should.have.property("careerTotalsPostSeason");
            msg.payload.should.have.property("seasonTotalsAllStarSeason");
            msg.payload.should.have.property("careerTotalsAllStarSeason");
            msg.payload.should.have.property("seasonTotalsCollegeSeason");
            msg.payload.should.have.property("careerTotalsCollegeSeason");
            msg.payload.should.have.property("seasonTotalsPreseason");
            msg.payload.should.have.property("careerTotalsPreseason");
            msg.payload.should.have.property("seasonRankingsRegularSeason");
            msg.payload.should.have.property("seasonRankingsPostSeason");
            msg.payload.should.have.property("seasonHighs");
            msg.payload.should.have.property("careerHighs");
            msg.payload.should.have.property("nextGame");
            done();
          });
          n1.receive({ payload: "201939" });
        });
      });

      it('player shot chart', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "shot chart", season: "2018-19", "season_type": "Regular Season", player_id: "201939"},
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
          n1.receive({ payload: "201939" });
        });
      });

      it('(node) season load from msg.season', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "shot chart", season: "dynamic", season_type: "Regular Season", player_id: "201939"},
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
          n1.receive({ payload: "", season: "2018-19" });
        });
      });

      it('(node) season_type load from msg.season_type', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "shot chart", season: "{{payload}}", season_type: "dynamic", player_id: "201939"},
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
          n1.receive({ payload: "2018-19", season_type: "Regular Season" });
        });
      });

      it('player splits', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "shot chart", season: "2018-19", "season_type": "Regular Season", "measure_type": "Base", player_id: "201939"},
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
          n1.receive({ payload: "201939" });
        });
      });

      it('(node) measure_type load from msg.measure_type', function (done) {
        var flow = [
          { id: "n1", type: "player", name: "player", wires:[["n2"]], player_type: "shot chart", season: "2018-19", "season_type": "Regular Season", "measure_type": "dynamic", player_id: "201939"},
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
          n1.receive({ payload: "201939", measure_type: "Base" });
        });
      });



    

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });
});


