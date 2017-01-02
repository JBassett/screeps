module.exports = {
    ROLE:'miner',
    BODY_BASE: [WORK, MOVE],
    BODY_ADD: [WORK],
    canCreate: function(spawner){
        return spawner.canCreateCreep(this.BODY) == OK;
    },
    current: function(spawner){
        return _.filter(Game.creeps, (creep) => spawner.room.name == creep.room.name && creep.memory.role == this.ROLE);
    },
    // Make sure there is a place for the miner to go!
    shouldCreate: function(spawner){
        let loc = this.selectLocation(spawner);
        
        return loc != null;
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
        // Get all the miners that have targets
        let miners = creep.room.find(FIND_MY_CREEPS, {filter: (c)=>c.memory.role == this.ROLE && c.memory.target != null})
        // Find all the conatiners that don't have a miner already
        let openContainers = _.filter(containers, (c)=> !_.some(miners, (m)=> c.pos.isEqualTo(Game.getObjectById(m.memory.target))));
        
        return openContainers.length > 0 ? creep.pos.findClosestByPath(openContainers) : null;
    },
    run: function (creep){
        if(creep.memory.target == null){
            console.log(creep.name + ' ('+this.ROLE+') is looking for a location to mine.');
            let loc = this.selectLocation(creep);
            if(loc == null){
                // If we can't find a place.... idk....
                return;
            }
            creep.memory.target = loc.id;
            console.log(JSON.stringify(Game.getObjectById(creep.memory.target)));
        }
        let target = Game.getObjectById(creep.memory.target);
        if(!target.pos.isEqualTo(creep.pos)){
            creep.say('Moving');
            //console.log(JSON.stringify(target));
            creep.moveTo(target);
        }
        else{
            if(creep.memory.source == null)
                creep.memory.source = creep.pos.findInRange(FIND_SOURCES, 1)[0].id;
            let source = Game.getObjectById(creep.memory.source);
            if(creep.harvest(source) < 0)
                creep.say('HELP!');
        }
        
    }
};
