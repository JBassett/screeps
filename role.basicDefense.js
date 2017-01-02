module.exports = {
    ROLE:'basicDefense',
    BODY_BASE: [MOVE, MOVE, ATTACK],
    BODY_ADD: [ATTACK, TOUGH],
    canCreate: function(spawner){
        return spawner.canCreateCreep(this.BODY) == OK;
    },
    current: function(spawner){
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    shouldCreate: function(spawner){
        return this.current(spawner).length < spawner.room.find(FIND_HOSTILE_CREEPS);// spawner.memory.minNumber[this.ROLE];
    },
    create: function(spawner){
        let body = this.BODY_BASE.slice();
        while(spawner.canCreateCreep(body.concat(this.BODY_ADD)) == OK){
            body = body.concat(this.BODY_ADD);
        }
        return spawner.createCreep(body, undefined, {role: this.ROLE});
    },
    run: function (creep){
        if(creep.room.find(FIND_HOSTILE_CREEPS).length > 0){
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if(creep.attack(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
        }
    }
};
