var roleHarvester = require('role.harvester');
var roleHauler = require('role.hauler');

module.exports = {
    ROLE:'upgrader',
    BODY_BASE: [CARRY, MOVE, WORK],
    BODY_ADD: [WORK, MOVE],
    current: function(spawner){
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    // 1 if there is less than 2 full mining crews, 4 otherwise.
    shouldCreate: function(spawner){
        let numHaulers = roleHauler.current(spawner).length;
        let numUpgraders = this.current(spawner).length;
        return (numHaulers < roleHauler.HAULERS_PER_MINER * 2 && numUpgraders < 1)
            || (numHaulers >= roleHauler.HAULERS_PER_MINER * 2 && numUpgraders < 4);
    },
    create: function(spawner){
        let body = this.BODY_BASE.slice();
        while(spawner.canCreateCreep(body.concat(this.BODY_ADD)) == OK){
            body = body.concat(this.BODY_ADD);
        }
        return spawner.createCreep(body, undefined, {role: this.ROLE});
    },
    run: function (creep){
        if(roleHarvester.shouldCreate(creep)){
            roleHarvester.run(creep);
            creep.say('Harvest!')
            return
        }
        // if(creep.room.controller.ticksToDowngrade > 3000){
        //     roleHarvester.run(creep);
        //     return;
        // }
        if(creep.carry.energy == 0) {
            // find closest spawn, extension or tower which is not full
            let struct = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy > 1
            });
            if(creep.withdraw(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(struct);
            }
        }
        else {
            //creep.say('Depositing');
            if(creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    }
};
