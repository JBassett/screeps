var roleMiner = require('role.miner');

module.exports = {
    ROLE:'hauler',
    BODY_BASE: [CARRY, MOVE],
    BODY_ADD: [CARRY, MOVE],
    HAULERS_PER_MINER: 2,
    canCreate: function(spawner){
        return spawner.canCreateCreep(this.BODY) == OK;
    },
    current: function(spawner){
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    shouldCreate: function(spawner){
        return this.current(spawner).length < this.HAULERS_PER_MINER * roleMiner.current(spawner).length;
    },
    create: function(spawner){
        let body = this.BODY_BASE.slice();
        while(spawner.canCreateCreep(body.concat(this.BODY_ADD)) == OK){
            body = body.concat(this.BODY_ADD);
        }
        return spawner.createCreep(body, undefined, {role: this.ROLE});
    },
    selectLocation: function(creep){
        var target = null;
        let sources = creep.room.find(FIND_SOURCES);
        // Find all containers that are adjacent to a source.
        let containers = creep.room.find(FIND_STRUCTURES, {filter: function (s){return s.structureType == STRUCTURE_CONTAINER && _.some(sources, (source)=> source.pos.inRangeTo(s, 1))}});
        // Get all the haulers that have targets
        let haulers = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>c.memory.role == this.ROLE && c.memory.target != null})
        // Find all the conatiners that don't have a miner already
        let openContainers = _.filter(containers, (c)=> _.filter(haulers, (h)=> c.pos.isEqualTo(Game.getObjectById(h.memory.target))).length < this.HAULERS_PER_MINER);
        
        return openContainers.length > 0 ? creep.pos.findClosestByPath(openContainers) : null;
    },
    run: function (creep){
        if(creep.carry.energy > creep.carryCapacity/2) {
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
        else {
            if(creep.memory.target == null){
                console.log(creep.name + ' ('+this.ROLE+') is looking for a container to withdraw from.');
                let loc = this.selectLocation(creep);
                if(loc == null){
                    return;
                }
                creep.memory.target = loc.id;
                console.log(creep.name, ' has found a Target.');
            }
            let cont = Game.getObjectById(creep.memory.target);
            if(cont.store[RESOURCE_ENERGY] == 0)
                cont = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: function (s){return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0}});
            if(creep.withdraw(cont, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(cont);
            }
        }
    }
};
