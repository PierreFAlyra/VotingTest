const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const constants = require('@openzeppelin/test-helpers/src/constants');

contract("Voting", accounts => {

  let Voting = artifacts.require("Voting");

  const _owner = accounts[0];

  let VotingInstance;
  
  beforeEach(async function() {
    VotingInstance = await Voting.new({from: _owner});
  });
  
});
