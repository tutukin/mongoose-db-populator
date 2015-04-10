var async = require('async');

var Suite = module.exports = function Suite (suiteName, populator) {
    this._name = suiteName;
    this._populator = populator;
    this._mongoose = populator.mongoose();

    this.docs = {};
};

var p = Suite.prototype;

p.name = function name () {
    return this._name;
};


p.create = function create (modelName, options) {
    var factory = this._populator.model(modelName);
    var doc = factory(options);

    if ( ! this.docs[modelName] ) {
        this.docs[modelName] = [];
    }
    this.docs[modelName].push(doc);

    return doc;
};




p.build = function build (options, done) {
    if ( typeof done === 'undefined' && typeof options === 'function' ) {
        done = options;
        options = {};
    }

    var _this = this;
    if ( this._mongoose.connection.readyState === 1 ) {
        return this._build(options, done);
    }

    this._mongoose.connection.on('connected', function () {
        _this._build(options, done);
    });


};

p._build = function build (options, done) {
    var _this = this;

    if ( typeof done === 'undefined' && typeof options === 'function' ) {
        done = options;
        options = {};
    }

    var suiteFactory = this._populator.suite(this.name());
    suiteFactory.call(this, options);

    var tasks = [];

    this._mongoose.modelNames().forEach(function (mn) {
        tasks.push( _this._wrapTask(_this._mongoose.model(mn), 'remove') );
    });

    Object.keys(this.docs).forEach( function (modelName) {
        _this.docs[modelName].forEach(function (doc) {
            tasks.push(_this._wrapTask(doc, 'save'));
        });
    });

    async.waterfall(tasks, function (err) {
        done(err);
    });
};


p.getFirst = function getFirst (modelName) {
    return this.docs[modelName][0];
};

p.getDocs = function getDocs (modelName) {
    var docs = this.docs[modelName];
    if ( ! docs ) {
        throw Error('Create some docs using model "' + modelName + '" first')
    }
    return docs;
};

p.getRandom = function getRandom (modelName) {
    var docs = this.getDocs(modelName);
    var index = this._getRandomIndex(docs.length);
    return docs[index];
};

p.find = function find (modelName, conditions, options) {
    options = options || {};
    conditions = conditions || {};
    var res = [];
    var docs = this.getDocs(modelName);

    var i = docs.length - 1;
    for ( ; i >= 0; i-- ) {
        if ( this._match(docs[i], conditions) ) {
            res.push(docs[i]);
            if ( options.limit && res.length === options.limit ) {
                break;
            }
        }
    }

    return res;
};

p._match = function _match (doc, conditions) {
    var res = true;
    var keys = Object.keys(conditions);
    var i = keys.length;

    for ( ; i >= 0; i-- ) {
        if ( doc[keys[i]] !== conditions[keys[i]] ) {
            res = false;
            break;
        }
    }

    return res;
};

p._getRandomIndex = function _getRandomIndex (length) {
    return Math.round( (length-1) * Math.random() );
};

p._wrapTask = function _wrapTask (obj, method, args) {
    var _args = Array.isArray(args) ? [].concat(args) : [];
    return function (cb) {
        _args.push(function (err) {
            cb(err);
        });
        obj[method].apply(obj, _args);
    };
};
