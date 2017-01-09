module.exports = {
    ROLE: 'longHarvester',
    BODY: [CARRY, CARRY, MOVE, MOVE, WORK],
    canCreate: function(spawner) {
        return spawner.canCreateCreep(this.BODY) == OK;
    },
    current: function() {
        return _.filter(Game.creeps, (creep) => creep.memory.role == this.ROLE);
    },
    shouldCreate: function(spawner) {
        return this.current().length < 0; //spawner.memory.minNumber[this.ROLE];
    },
    create: function(spawner, dest) {
        return spawner.createCreep(this.BODY, undefined, {
            role: this.ROLE,
            home: spawner.room.name,
            dest: dest
        });
    },
    run: function(creep) {
        // need to go dest room
        //console.log(JSON.stringify(creep.carry));
        if (creep.carry.energy < creep.carryCapacity) {
            if (creep.room.name != creep.memory.dest) {
                let exit = creep.room.findExitTo(creep.memory.dest);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                let energySource = creep.pos.findClosestByPath(FIND_SOURCES);
                if (creep.harvest(energySource) == ERR_NOT_IN_RANGE)
                    creep.moveTo(energySource);
            }
        }
        // full, head home
        else {
            if (creep.room.name != creep.memory.home) {
                let exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            } else {
                // find closest spawn, extension or tower which is not full
                let struct = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                            s.structureType == STRUCTURE_EXTENSION ||
                            s.structureType == STRUCTURE_TOWER) &&
                        s.energy < s.energyCapacity
                });
                if (creep.transfer(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    creep.moveTo(struct)
            }
        }
    }
};
