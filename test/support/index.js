var path = require('path');
var sinon = require('sinon');
var chai = require('chai');
var proxyquire = require('proxyquire').noCallThru();

chai.use(require('sinon-chai'));

module.exports = {
    sinon:  sinon,
    chai:   chai,
    proxyMod: proxyMod
};

function proxyMod (modName, deps) {
    var p = path.join(__dirname, '..', '..', 'src', modName);
    return proxyquire(p, deps);
}
