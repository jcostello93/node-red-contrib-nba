
var should = require("should");
var helper = require("node-red-node-test-helper");
var nbaNode = require("../nba.js")

helper.init(require.resolve('node-red'));

console.log("It is recommended to comment line 4 'NBA.updatePlayers()' out of ../nba.js or else the tests will hit a rate limit");

describe('Database node: ', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    }); 

      
      it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "database", name: "database" }];
        helper.load(nbaNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'database');
          done();
        });
      });

      it('update players database', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "update"},
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
              msg.should.have.property("payload");
              msg.payload.length.should.be.above(0);
              msg.payload[0].should.have.property("firstName");
              msg.payload[0].should.have.property("lastName");
              msg.payload[0].should.have.property("playerId");
              msg.payload[0].should.have.property("teamId");
              msg.payload[0].should.have.property("fullName");
              msg.payload[0].should.have.property("downcaseName");
              done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('get all players', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "all players" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.length.should.be.above(0);
                msg.payload[0].should.have.property("firstName");
                msg.payload[0].should.have.property("lastName");
                msg.payload[0].should.have.property("playerId");
                msg.payload[0].should.have.property("teamId");
                msg.payload[0].should.have.property("fullName");
                msg.payload[0].should.have.property("downcaseName");
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('get all teams', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "all teams" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.length.should.eql(30);
                msg.payload[0].should.have.property("teamId");
                msg.payload[0].should.have.property("abbreviation");
                msg.payload[0].should.have.property("teamName");
                msg.payload[0].should.have.property("simpleName");
                msg.payload[0].should.have.property("location");
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('get one player by id', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one player", object_id: "201939", source: "id" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("playerId", 201939)
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('get one player by name', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one player", source: "name", first_name: "Stephen", last_name: "Curry" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("playerId", 201939)
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('get one team by id', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one team", object_id: "1610612752", source: "id" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
              msg.should.have.property("payload");
              msg.payload.should.have.property("teamId", 1610612752);
              done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('get one team by name', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one team", source: "name", team_name: "Knicks" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.payload.should.eql({"teamId":1610612752,"abbreviation":"NYK","teamName":"New York Knicks","simpleName":"Knicks","location":"New York"})
                done();
          });
          n1.receive({ payload: "" });
        });
      });

      it('(node) first_name mustache', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one player", source: "name", first_name: "{{payload}}", last_name: "Curry" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("playerId", 201939)
                done();
          });
          n1.receive({ payload: "Stephen" });
        });
      });

      it('(node) last_name mustache', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one player", source: "name", first_name: "Stephen", last_name: "{{payload}}" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("playerId", 201939)
                done();
          });
          n1.receive({ payload: "Curry" });
        });
      });

      it('(node) team_name mustache', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one team", source: "name", team_name: "{{payload}}" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.payload.should.have.property("teamId", 1610612752);
                done();
          });
          n1.receive({ payload: "Knicks" });
        });
      });

      it('(node) preserve msg.topic', function (done) {
        var flow = [
          { id: "n1", type: "database", name: "get",wires:[["n2"]], database_type: "get data", get_type: "one team", source: "name", team_name: "{{payload}}" },
          { id: "n2", type: "helper" }
        ];
        helper.load(nbaNode, flow, function () {
          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");
          n2.on("input", function (msg) {
                msg.should.have.property("payload");
                msg.should.have.property("topic", "testing");
                done();
          });
          n1.receive({ payload: "Knicks", "topic": "testing" });
        });
      });

      

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });
});


