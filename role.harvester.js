var roleHauler = require('role.hauler');

module.exports = {
    ROLE:'harvester',
    BODY_BASE: [CARRY, MOVE, WORK],
    BODY_ADD: [CARRY, MOVE],
    canCreate: function(spawner){
        return spawner.canCreateCreep(this.BASE_BODY) == OK;
    },
    current: function(spawner){
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    // Only create if we don't have a miner and full number of haulers and then only create 3.
    shouldCreate: function(spawner){
        return roleHauler.current(spawner).length < roleHauler.HAULERS_PER_MINER && this.current(spawner).length < 3;
    },
    create: function(spawner){
        let body = this.BODY_BASE.slice();
        while(spawner.canCreateCreep(body.concat(this.BODY_ADD)) == OK){
            body = body.concat(this.BODY_ADD);
        }
        return spawner.createCreep(body, undefined, {role: this.ROLE});
    },
    run: function (creep){
        if(creep.carry.energy < creep.carryCapacity) {
            //creep.say('Harvesting')
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else {
            //creep.say('Depositing');
            let struct = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN
                                 || s.structureType == STRUCTURE_EXTENSION
                                 || s.structureType == STRUCTURE_TOWER)
                                 && s.energy < s.energyCapacity
                });
                
            if(creep.transfer(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(struct);
            }
        }
    }
};
