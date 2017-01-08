var roleUpgrader = require('role.upgrader');

module.exports = {
    ROLE:'builder',
    BODY_BASE: [CARRY, MOVE, WORK],
    BODY_ADD: [WORK],
    canCreate: function(spawner){
        return spawner.canCreateCreep(this.BODY) == OK;
    },
    current: function(spawner){
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    shouldCreate: function(spawner){
        return this.current(spawner).length < 1;// spawner.memory.minNumber[this.ROLE];
    },
    create: function(spawner){
        let body = this.BODY_BASE.slice();
        while(spawner.canCreateCreep(body.concat(this.BODY_ADD)) == OK){
            body = body.concat(this.BODY_ADD);
        }
        return spawner.createCreep(body, undefined, {role: this.ROLE});
    },
    run: function (creep){
        if(creep.room.find(FIND_MY_CONSTRUCTION_SITES).length == 0){
            roleUpgrader.run(creep);
            return;
        }
        if(creep.carry.energy == 0) {
            let struct = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_CONTAINER)
                             && s.energy > 10
            });
            if(creep.withdraw(struct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(struct);
            }
        }
        else {
            var plan = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);//_.sort(creep.room.find(FIND_MY_CONSTRUCTION_SITES), (c)=> c.progress / c.progressTotal)[0];
            //console.log(plan);
            if(creep.build(plan) == ERR_NOT_IN_RANGE) {
                creep.moveTo(plan);
            }
        }
    }
};
