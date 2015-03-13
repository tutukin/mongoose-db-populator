var test = require('../test/support');
var expect = test.chai.expect;

describe('Suite', function () {
    beforeEach( function () {
        this.async = {
            waterfall: test.sinon.stub()
        };

        this.mongoose = {
            modelNames: test.sinon.stub().returns([]),
            model:      test.sinon.stub(),
            connection: {
                readyState: 0,
                on:         test.sinon.stub()
            }
        };

        this.Suite = test.proxyMod('Suite', {
            async:      this.async
        });

        this.sn = 'suite name';

        this.populator = {
            model:      test.sinon.stub(),
            suite:      test.sinon.stub(),
            mongoose:   test.sinon.stub().returns(this.mongoose)
        };

        this.suite = new this.Suite(this.sn, this.populator);
    });

    it('should e a function', function () {
        expect(this.Suite).to.be.a('function');
    });

    describe('#name()', function () {
        it('should return suiteName', function () {
            expect(this.suite.name()).equals(this.sn);
        });
    });


    describe('#create(modelName, options)', function () {
        it('should be an instance method', function () {
            expect(this.Suite).to.respondTo('create');
        });

        it('should call populator.factory(modelName)(options) and return its result', function () {
            var modelName = 'model name';
            var doc = {a: 'mongoose document'};
            var modelFactory = test.sinon.stub().returns(doc);
            var options = {};

            this.populator.model.withArgs(modelName).returns(modelFactory);

            var res = this.suite.create(modelName, options);

            expect(modelFactory).calledOnce.and.calledWithExactly(options);
            expect(res).equals(doc);
        });
    });






    describe('#getFirst(modelName)', function () {
        it('should be an instance method', function () {
            expect(this.Suite).to.respondTo('getFirst');
        });

        it('should return the document, created first with #create(modelName)', function () {
            var modelName = 'a model name';
            var doc = {a: 'mongoose document'};

            var modelFactory = test.sinon.stub();
            modelFactory.onCall(0).returns(doc);
            modelFactory.returns(null);
            this.populator.model.withArgs(modelName).returns(modelFactory);

            this.suite.create(modelName, {});
            this.suite.create(modelName, {});

            expect(this.suite.getFirst(modelName)).to.equal(doc);
        });
    });


    describe('#getRandom(modelName)', function () {
        it('should be an instance method', function () {
            expect(this.Suite).to.respondTo('getRandom');
        });

        it('should return the random document', function () {
            var modelName = 'a model name';
            var doc = {a: 'mongoose document'};

            var modelFactory = test.sinon.stub();
            modelFactory.onCall(0).returns(null);
            modelFactory.onCall(1).returns(doc);
            this.populator.model.withArgs(modelName).returns(modelFactory);

            this.suite._getRandomIndex = test.sinon.stub().returns(1);

            this.suite.create(modelName, {});
            this.suite.create(modelName, {});

            expect(this.suite.getRandom(modelName)).to.equal(doc);
        });
    });


    describe('#find(modelName, conditions, options)', function () {
        it('should be an instance method', function () {
            expect(this.Suite).to.respondTo('find');
        });

        it('should find docs by direct matching values in doc and in conditions', function () {
            var modelName = 'model name';
            var modelFactory = test.sinon.stub();
            this.populator.model.withArgs(modelName).returns(modelFactory);

            var obj1 = { a: 'a', b: 'b', c: 'c'};
            var obj2 = { a: 'aa', b: 'bb', c: 'cc'};
            var obj3 = { a: 'aa', b: 'd', c: 'cc'};
            modelFactory.onCall(0).returns(obj1);
            modelFactory.onCall(1).returns(obj2);
            modelFactory.onCall(2).returns(obj3);

            this.suite.create(modelName, {});
            this.suite.create(modelName, {});
            this.suite.create(modelName, {});

            var res = this.suite.find(modelName, {a:'aa', c:'cc'});

            expect(res).to.include(obj2);
            expect(res).to.include(obj3);
        });


        it('should understand limit option', function () {
            var modelName = 'model name';
            var modelFactory = test.sinon.stub();
            this.populator.model.withArgs(modelName).returns(modelFactory);

            var obj1 = { a: 'a', b: 'b', c: 'c'};
            var obj2 = { a: 'aa', b: 'bb', c: 'cc'};
            var obj3 = { a: 'aa', b: 'd', c: 'cc'};
            modelFactory.onCall(0).returns(obj1);
            modelFactory.onCall(1).returns(obj2);
            modelFactory.onCall(2).returns(obj3);

            this.suite.create(modelName, {});
            this.suite.create(modelName, {});
            this.suite.create(modelName, {});

            var res = this.suite.find(modelName, {a:'aa', c:'cc'}, {limit:1});

            expect(res).to.have.length(1);
            expect(res[0] === obj2 || res[0] === obj3).to.be.true;
        });
    });



    describe('#build(done)', function () {

        it('should be an instance methos', function () {
            expect(this.Suite).to.respondTo('build')
        });

        describe('when mongoose is connected', function () {
            beforeEach( function () {
                this.suite._build = test.sinon.spy();
                this.mongoose.connection.readyState = 1;
            });

            it('should immediately call #_build', function () {
                var done = test.sinon.spy();
                this.suite.build(done);

                expect(this.suite._build).calledOnce
                    .and.calledWithExactly(done);
            });
        });


        describe('when mongoose is not connected', function () {
            beforeEach( function () {
                this.suite._build = test.sinon.spy();
                this.mongoose.connection.readyState = 0;
            });

            it('should not call #_build immediately', function () {
                var done = test.sinon.spy();
                this.suite.build(done);
                expect(this.suite._build).not.called;
            });

            it('should attach a listener to connection "connected" event', function () {
                var done = test.sinon.spy();
                this.suite.build(done);

                expect(this.mongoose.connection.on).calledOnce
                    .and.calledWithExactly('connected', test.sinon.match.func);
            });

            it('should call #_build() on "connected" event', function () {
                var done = test.sinon.spy();
                this.mongoose.connection.on.yields(null);

                this.suite.build(done);

                expect(this.suite._build).calledOnce
                    .and.calledWithExactly(done);
            });

        });
    });



    describe('#_build(done)', function () {
        beforeEach( function () {
            this.suiteFactory = test.sinon.spy();
            this.populator.suite.withArgs(this.sn).returns(this.suiteFactory);
        });

        it('should be an instance method', function () {
            expect(this.Suite).to.respondTo('_build');
        });

        it('should call suiteFactory bound to self', function () {
            var done = test.sinon.spy();

            this.suite._build(done);

            expect(this.suiteFactory).calledOnce
                .and.calledOn(this.suite);

        });

        it('should add document.save waterfall task for every created document', function () {
            var modelName = 'a model name';
            var doc1 = {a: 'mongoose document', _id: 1};
            var doc2 = {a: 'mongoose document', _id: 2};
            var task1 = test.sinon.spy();
            var task2 = test.sinon.spy();
            var done = test.sinon.spy();

            var modelFactory = test.sinon.stub();
            modelFactory.onCall(0).returns(doc1);
            modelFactory.onCall(1).returns(doc2);
            this.populator.model.withArgs(modelName).returns(modelFactory);

            this.suite._wrapTask = test.sinon.stub();
            this.suite._wrapTask.withArgs(doc1, 'save').returns(task1);
            this.suite._wrapTask.withArgs(doc2, 'save').returns(task2);

            this.suite.create(modelName, {});
            this.suite.create(modelName, {});

            this.suite._build(done);

            expect(this.async.waterfall).calledOnce;
            var tasks = this.async.waterfall.firstCall.args[0];

            expect(tasks).to.include(task1);
            expect(tasks).to.include(task2);
        });

        it('should call done with error if any when tasks are done', function () {
            var err = {an: 'error'};
            var done = test.sinon.spy();
            this.async.waterfall.yields(err);

            this.suite._build(done);

            expect(done).calledOnce
                .and.calledWithExactly(err);
        });

        it('should include remove task for every mongoose model', function () {
            var modelNames = ['A', 'B'];
            var A = {remove: test.sinon.spy()};
            var B = {remove: test.sinon.spy()};
            var task1 = test.sinon.spy();
            var task2 = test.sinon.spy();

            var done = test.sinon.spy();

            this.mongoose.modelNames.returns(modelNames);
            this.mongoose.model.withArgs('A').returns(A);
            this.mongoose.model.withArgs('B').returns(B);

            this.suite._wrapTask = test.sinon.stub();
            this.suite._wrapTask.withArgs(A, 'remove').returns(task1);
            this.suite._wrapTask.withArgs(B, 'remove').returns(task2);

            this.suite._build(done);
            var tasks = this.async.waterfall.firstCall.args[0];

            expect(tasks).to.include(task1);
            expect(tasks).to.include(task2);
        });
    });


    describe('#_wrapTask(obj, method, args)', function () {
        beforeEach( function () {
            this.obj = {};
            this.method = 'aMethod';
            this.obj[this.method] = test.sinon.stub();
        });

        it('should be an instance method', function () {
            expect(this.Suite).to.respondTo('_wrapTask');
        });

        it('should return a wrapper function', function () {
            res = this.suite._wrapTask(this.obj, this.method);
            expect(res).to.be.a('function');
        });

        describe('args is not an array', function () {
            beforeEach( function () {
                this.args = null;
            });

            describe('wrapper function', function () {
                beforeEach( function () {
                    this.wrapper = this.suite._wrapTask(this.obj, this.method, this.args);
                    this.cb = test.sinon.spy();
                });

                it('should call the method on obj, only a callback function', function () {
                    var method = this.obj[this.method];
                    this.wrapper(this.cb);

                    expect(method).calledOnce
                        .and.calledOn(this.obj)
                        .and.calledWithExactly(test.sinon.match.func);

                });

                describe('when method yields with error and arguments', function () {
                    beforeEach( function () {
                        var method = this.obj[this.method];
                        this.err = {an: 'error'};
                        method.yields(this.err, 'A', 'B');
                    });

                    it('should call the cb with error only', function () {
                        this.wrapper(this.cb);
                        expect(this.cb).calledOnce
                            .and.calledWithExactly(this.err);
                    });
                });
            });
        });

        describe('args is an array', function () {
            beforeEach( function () {
                this.args = [1, 2, 3];
            });

            describe('wrapper function', function () {
                beforeEach( function () {
                    this.wrapper = this.suite._wrapTask(this.obj, this.method, this.args);
                    this.cb = test.sinon.spy();
                });

                it('should call the method on obj, passing all args', function () {
                    var method = this.obj[this.method];
                    this.wrapper(this.cb);

                    expect(method).calledOnce
                        .and.calledOn(this.obj);
                    var args = method.firstCall.args;

                    this.args.forEach(function (arg, pos) {
                        expect(args[pos]).equal(arg);
                    });
                });

                it('should pass a callback', function () {
                    var method = this.obj[this.method];
                    this.wrapper(this.cb);
                    var args = method.firstCall.args;

                    expect(args[args.length-1]).to.be.a('function');
                });

                describe('when method yields with error and arguments', function () {
                    beforeEach( function () {
                        var method = this.obj[this.method];
                        this.err = {an: 'error'};
                        method.yields(this.err, 'A', 'B');
                    });

                    it('should call the cb with error only', function () {
                        this.wrapper(this.cb);
                        expect(this.cb).calledOnce
                            .and.calledWithExactly(this.err);
                    });
                });
            });

        });
    });

});
