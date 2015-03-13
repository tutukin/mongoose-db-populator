var Suite = require('./Suite');

function MDP (mongoose) {
    this._factory = {
        model:    {},
        suite:    {}
    };

    this._mongoose = mongoose;
}

var p = MDP.prototype;


p.mongoose = function mongoose () {
    return this._mongoose;
};


p.factory = function factory (type, name, factory) {
    var _this = this;

    if (typeof name === 'object') {
        Object.keys(name).forEach(function (mn) {
            _this._factory[type][mn] = name[mn];
        });

        return name;
    }

    if (typeof factory === 'function') {
        _this._factory[type][name] = factory;
    }

    return _this._factory[type][name];
};

p.suite = function suite (suiteName, suiteFactory) {
    return this.factory('suite', suiteName, suiteFactory);
};

p.model = function model (modelName, modelFactory) {
    return this.factory('model', modelName, modelFactory);
};

p.populate = function populate (suiteName, done) {
    var suiteFactory = this.suite(suiteName);
    var suite = new Suite(suiteName, this);
    suite.build(done);
    return suite;
};

module.exports = MDP;
