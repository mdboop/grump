var path = require('path');
var fs = require('fs');
var color = require('colors');
var utils = require('../utils.js');
var inquirer = require("inquirer");

module.exports = function (args, installedGrumps, isUpdate) {

  var grump = args[0];

    // Query server for grumps
    utils.queryServer(grump, function(err, res) {
      if (err) {
        if (err.code === "ENOTFOUND") {
          console.log("Error".red + ": Unable to contact grump servers. Are you online?");
        } else {
          console.log('queryServer error: ',err);
        }
      } else {

        // Multiple grumps found

        if (res.grumps.length > 1) {
          console.log("Found multiple remote grumps named " + grump.cyan + ".");
          console.log("Please choose a specific grump from the list below and rerun your command.\n");
          var choices = res.grumps.map(function(grump) {
            return grump.author + "/" + grump.defaultCommand;
          });

          var question = {
            type: 'list',
            choices: choices,
            message: 'Choose a grump to install',
            name: 'install'
          };

          inquirer.prompt([question], function( answers ) {
            var chosenIndex = choices.indexOf(answers.install);
            utils.install(res.grumps[chosenIndex], installedGrumps, isUpdate);
          });
          res.grumps.forEach(function(grump) {
            console.log("\t" + grump.author.green + "/" + grump.defaultCommand.cyan);
          });

          console.log("\n");

          // Only 1 grump found, ready to install/run
        } else if (res.grumps.length === 1) {
          // install it
          utils.install(res.grumps[0], installedGrumps, isUpdate);

          // No grumps found
        } else {
          console.log("Error".red + ": Grump " + grump.cyan + " was not found on the server.");
        }
      }
    });
};
