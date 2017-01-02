var roleHarvester = require('role.harvester');
var roleBasicDefense = require('role.basicDefense');
var roleUpgrader = require('role.upgrader');
var roleLongHarvester = require('role.longHarvester');
var roleRepairer = require('role.repairer');
var roleBuilder = require('role.builder');
var roleWallRepairer = require('role.wallRepaier');
var roleMiner = require('role.miner');
var roleHauler = require('role.hauler');
var roles = [roleHarvester, roleBasicDefense, roleUpgrader, roleRepairer, roleHauler, roleMiner, roleBuilder, roleWallRepairer];
// Setup a map of ROLE to the actual role.
var roleMap = {};
for(let i = 0; i<roles.length; i++){
    roleMap[roles[i].ROLE] = roles[i];
}

var displayCounts = function(){
    let roleToCreeps = _.groupBy(Game.creeps, (c)=> c.memory.role)
    for(let role in roleToCreeps){
        console.log(role+'s: ' + roleToCreeps[role].length);
    }
}

var cleanMemory = function(){
    //check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }
}

var createCreeps = function(spawn){
    let creepName = null;
    for(let i = 0; i < roles.length; i++){
        let role = roles[i];
        if(role.shouldCreate(spawn)){
            creepName = role.create(spawn);
            if(isNaN(creepName)){
                console.log(spawn.name, ': Creating ', role.ROLE, ' named ', creepName);
                cleanMemory();
                displayCounts();
            }else if(Game.time % 20 == 0 && creepName == ERR_NOT_ENOUGH_ENERGY) {
                console.log(spawn.name, ': Need more energy to create a ', role.ROLE);
                displayCounts();
            }
            break;
        }
    }
}

module.exports.loop = function () {
    for(let spawnName in Game.spawns){
        let spawn = Game.spawns[spawnName];
        createCreeps(spawn);
    }
    
    for(var name in Game.creeps) {
        let creep = Game.creeps[name];
        let role = roleMap[creep.memory.role];
        if(role != null){
            role.run(creep);
        }else {
            console.log('Unknown role type: ', creep.memory.role);
        }
    }
}