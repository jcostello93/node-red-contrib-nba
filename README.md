# node-red-contrib-nba
Access the NBA Stats API using Node-RED.

# Overview 
The goal of this project is to provide easy access to the robust, yet undocumented NBA Stats API using Node-RED, a visual, flow-based development tool. Whether you're looking to create an NBA database, get the latest scores and stats, peform data analysis, or build an interactive website, this tool will help you get the data you need without having to research all the endpoints of the NBA Stats API. 

# Dependencies and references
This project uses the nba npm module to call the various endpoints of the NBA Stats API. Please refer to this module's GitHub for futher information regarding the API's stability and usability as well as blacklisted IP addresses. 

# Nodes 

There are a total of 5 nba nodes: 

## Database

This node has the following uses: 

* get all NBA players
* get all NBA teams
* get one NBA player by name
* get one NBA player by id
* get one NBA player by name
* get one NBA team by name
* get one NBA team by id
* update the database 

Each player or team object contains a unique id used by the NBA Stats API. These are required by the player and team nodes. 

The first 7 functions do not make API calls. Instead, they search files of the nba npm module. The final function listed above makes an API call to update these files. They are also updated when the Node-RED application starts and imports the node-red-contrib-nba module. 

## Player

This node requires a player id. It will return the following information in relation to this player, based on its configuration: 

* the player's profile
* the player's career stats
* the player's shot chart
* the player's season splits 

## Team

This node requires a team id. It will return the following information in relation to this team, based on its configuration: 

* the team's profile
* the team's roster
* the team's season stats
* the team's shooting stats
* the team's season splits 
* the team's lineups 
* the team's shot chart 

## League

This node does not require an id, as it provides data for the entire league. It will return the following data based on its configuration: 

* the scoreboard for a given game day
* league leaders
* league standings
* game logs grouped by player or team
* player tracking grouped by player or team
* shooting stats grouped by player or team
* hustle stats grouped by player or team
* clutch stats grouped by player or team
* lineups 

## Game

This node requires a game id. It will return the following information in relation to this game, based on its configuration: 

* the game's box score
* the game's play-by-play
* the game's shot chart

The get a game id, use the league node to get a scoreboard for a given game day. The game id will be located in <code> msg.payload.gameHeader[i].gameId</code>.


# Using the nodes 

## Valid Parameters

The nodes dynamically load dropdown options from the nba.json file in the nba-client-template npm module. 

## Dynamically loading inputs

Most of the node inputs can be dynamically loaded. There are two ways to do this. 

### Text fields

**Text fields** may be hardcoded or dynamically populated via mustache syntax relative to the incoming msg object. For example, if the season is located in <code>msg.payload.season</code>, then you can fill <code>{{payload.season}}</code> in the season field.

A simple example is using the database node to get a team by name and then sending the response to a team node. Because the database node returns a team object in <code>msg.payload</code> with the team id in <code>msg.payload.teamId</code>, you can now fill in <code>{{payload.teamId}}</code> in the team id field of the team node. 

TO DO: Add screenshot

### Dropdown options

**Dropdown fields** may be selected from the menu or dynamically populated via the specified property of the incoming msg object. For example, if loading measure type dynamically, the dropdown menu designates <code>msg.measure_type</code> as the specified property. 

## Getting id's

Use the database node to get player and team id's. 

Use the league node

## The cleanedData field

Some responses from the NBA Stats API return result sets that map <code>headers</code>, an array of strings, to <code>rowSet</code>, an array of arrays. 

In this case, the node-red-contrib-nba module adds a cleanedData field that combines these arrays into an array of objects that might be easier to work with. 

    Ex result set: obj.headers = [PTS, MIN]
                   obj.rowSet = [[25, 37], [40, 35]]

	Ex cleanedData = [{PTS: 25, MIN: 37}, {PTS: 40, MIN: 35}]


# Tests

The /test directiory contains unit tests for each node using the node-red-test-helper and mocha libraries. 

To run all tests: 

    npm test

To test the database node: 
    
    npm run test-database
    
To test the player node: 
    
    npm run test-player

To test the team node: 
    
    npm run test-team

To test the league node: 
    
    npm run test-league

To test the game node: 
    
    npm run test-game

# Example flows 

## Get all players. Download the flow. 

## Save all players in a file. Download the flow. 

## Develop an interactive website that displays the current year's standings. 

## Develop an interactive website that displays a day's scoreboard. Download the flow. 

## Develop an interactive website that displays a team's lineups. Download the flow. 






