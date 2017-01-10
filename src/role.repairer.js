var roleBuilder = require('role.builder');

module.exports = {
    ROLE: 'repairer',
    BODY_BASE: [WORK, MOVE, CARRY],
    BODY_ADD: [WORK, MOVE],
    canCreate: function(spawner) {
        return spawner.canCreateCreep(this.BODY) == OK;
    },
    current: function(spawner) {
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    shouldCreate: function(spawner) {
        return this.current(spawner).length < 1; //spawner.memory.minNumber[this.ROLE];
    },
    create: function(spawner) {
        let body = this.BODY_BASE.slice();
        while (spawner.canCreateCreep(body.concat(this.BODY_ADD)) == OK) {
            body = body.concat(this.BODY_ADD);
        }
        return spawner.createCreep(body, undefined, {
            role: this.ROLE
        });
    },
    run: function(creep) {
        if (creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
            }).length == 0 ||
            creep.room.energyCapacity / creep.room.energyCapacityAvailable < .25) {
            roleBuilder.run(creep);
            return;
        }
        if (creep.carry.energy == 0) {
            // find closest spawn, extension or tower which is not full
            let struct = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                        s.structureType == STRUCTURE_EXTENSION ||
                        s.structureType == STRUCTURE_CONTAINER) &&
                    s.energy > 1
            });
            if (creep.withdraw(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(struct);
            }
        } else {
            var plan = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax &&
                    s.structureType != STRUCTURE_WALL &&
                    s.structureType != STRUCTURE_RAMPART
            });
            if (creep.repair(plan) == ERR_NOT_IN_RANGE) {
                creep.moveTo(plan);
            }
        }
    }
};
