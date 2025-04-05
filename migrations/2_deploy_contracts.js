const Akademik = artifacts.require("Akademik");

module.exports = function (deployer) {
    deployer.deploy(Akademik)
}