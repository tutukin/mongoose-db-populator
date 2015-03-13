var test = require('../test/support');
var expect = test.chai.expect;

describe('MongooseDbPopulator(mongoose)', function () {
    beforeEach( function () {
        this.Suite = test.sinon.stub();
        this.suite = {
            build:  test.sinon.spy()
        };

        this.MDP = test.proxyMod('MongooseDbPopulator', {
            './Suite': this.Suite
        });

        this.mongoose = {};

        this.mdp = new this.MDP(this.mongoose);
    });

    it('should be a function', function () {
        expect(this.MDP).to.be.a('function');
    });


    describe('#mongoose()', function () {
        it('should be an instance method and return a mongoose instance', function () {
            expect(this.MDP).to.respondTo('mongoose');
            expect(this.mdp.mongoose()).to.equal(this.mongoose);
        });
    });


    describe('#factory(type, name, factory)', function () {
        it('should be an instance method', function () {
            expect(this.MDP).to.respondTo('factory');
        });

        it('should return factory', function () {
            var type = 'model';
            var name = 'modelName';
            var factory = test.sinon.spy();

            var res = this.mdp.factory(type, name, factory);

            expect(res).equals(factory);
        });

        it('should return factory by type and name if it was previously set', function () {
            var type = 'suite';
            var name = 'suiteName';
            var factory = test.sinon.spy();
            var res;

            this.mdp.factory(type, name, factory);
            res = this.mdp.factory(type, name);

            expect(res).equals(factory);
        });

        describe('#factory(type, factoryHash)', function () {
            beforeEach( function () {
                this.factoryHash = {
                    'factoryName': test.sinon.spy()
                };
            });

            it('should treat key as name and value as factory', function () {
                var type = 'model';
                this.mdp.factory(type, this.factoryHash);
                expect(this.mdp.factory(type, 'factoryName')).to.equal(this.factoryHash.factoryName);
            });

            it('should not owervrite other suite factories', function () {
                var type = 'suite';
                var name = 'a name for a suite';
                var factory = test.sinon.spy();
                this.mdp.factory(type, name, factory);
                this.mdp.factory(type, this.factoryHash);

                expect(this.mdp.factory(type, name)).to.equal(factory);
            });
        });
    });


    describe('#suite(suiteName, suiteFactory)', function () {
        it('should be an instance method', function () {
            expect(this.MDP).to.respondTo('suite');
        });

        it('should call #factory("suite", suiteName, suiteFactory) and return the result', function () {
            var suiteName = 'a name for a suite';
            var suiteFactory = test.sinon.spy();
            this.mdp.factory = test.sinon.stub().returns(suiteFactory);

            var res = this.mdp.suite(suiteName, suiteFactory);

            expect(this.mdp.factory).calledOnce
                .and.calledWithExactly("suite", suiteName, suiteFactory);

            expect(res).equals(suiteFactory);
        });
    });

    describe('#model(modelName, modelFactory)', function () {
        it('should be an instance method', function () {
            expect(this.MDP).to.respondTo('model');
        });

        it('should call #factory("model", modelName, modelFactory) and return the result', function () {
            var modelName = 'a model name';
            var modelFactory = test.sinon.spy();
            this.mdp.factory = test.sinon.stub().returns(modelFactory);

            var res = this.mdp.model(modelName, modelFactory);

            expect(this.mdp.factory).calledOnce
                .and.calledWithExactly('model', modelName, modelFactory);

            expect(res).equals(modelFactory);
        });
    });







    describe('#populate(suiteName, done)', function () {
        beforeEach( function () {
            this.sn = 'suite name';
            this.sf = test.sinon.spy();
            this.done = test.sinon.spy();
            this.Suite.returns(this.suite);
            this.mdp.suite(this.sn, this.sf);
        });
        it('should be an instance method', function () {
            expect(this.MDP).to.respondTo('populate');
        });

        it('should instantiate the suite with suiteName and self', function () {
            this.mdp.populate(this.sn, this.done);

            expect(this.Suite).calledOnce
                .and.calledWithExactly(this.sn, this.mdp);
        });

        it('should return the instance of suite', function () {
            var suite = this.mdp.populate(this.sn, this.done);

            expect(suite).to.exist.and.equal(this.suite);
        });

        it('should call suite.build(done)', function () {
            var suite = this.mdp.populate(this.sn, this.done);
            expect(this.suite.build).calledOnce
                .and.calledWithExactly(this.done);
        });
    });

});
