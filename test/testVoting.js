const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const constants = require('@openzeppelin/test-helpers/src/constants');

contract("Voting", accounts => {

  let Voting = artifacts.require("Voting");
  

  const _owner = accounts[0];
  const _voter = accounts[1];
  const _otherVoter = accounts[2];

  let votingInstance;

  describe("Deployement", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
    });

    describe("Constructor", function () {
      it("Should set the right owner", async function () {
        expect(await votingInstance.owner()).to.equal(_owner);
      });
    });

    describe("Initalization", function () {
      it("Should init workflowstatus to RegisteringVoters", async function () {
        const workflowStatus = await votingInstance.workflowStatus();
        expect(workflowStatus).to.be.bignumber.equal(new BN(0));
      });

      it("Should init winningProposalId to 0", async function () {
        const winningProposalID = await votingInstance.winningProposalID();
        expect(winningProposalID).to.be.bignumber.equal(new BN(0));
      });
    });
  });

  describe("Getters access", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
    });

    describe("Get Voter", async function () {
      it("Should revert with right error if not called from a voter", async function () {
           await expectRevert(votingInstance.getVoter(_owner, {from: _owner}),
                              "You're not a voter");
      });
    });

    describe("Get one proposal", async function () {
      it("Should revert with right error if not called from a voter", async function () {
        await expectRevert(votingInstance.getOneProposal(new BN(0), {from: _owner}),
                           "You're not a voter");
      });
    });
  });

  

  describe("AddVoter", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.addVoter(_voter, {from: _voter}),
                           "Ownable: caller is not the owner");
      });

      it("Should revert with right error if register multiple times from the same account", async function () {
        await votingInstance.addVoter(_voter);
        await expectRevert(votingInstance.addVoter(_voter),
                           "Already registered");
      });

      it("Should register one voter", async function () {
        await votingInstance.addVoter(_voter);
        const voter  = await votingInstance.getVoter(_voter, {from: _voter});
        expect(voter.isRegistered).to.be.true;
      });

      it("Should register two voters", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.addVoter(_otherVoter);
        const voter  = await votingInstance.getVoter(_otherVoter, {from: _voter});
        expect(voter.isRegistered).to.be.true;
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"VoterRegistered\"", async function () {
        expectEvent(await votingInstance.addVoter(_voter),
                    'VoterRegistered',
                    {voterAddress: _voter});
      });
    });
  });

  describe("AddProposal", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.addVoter(_voter);
      await votingInstance.startProposalsRegistering();
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from a voter", async function () {
        await expectRevert(votingInstance.addProposal("", {from: _owner}),
                           "You're not a voter");
      });

      it("Should revert with right error if the description is empty", async function () {
        await expectRevert(votingInstance.addProposal("", {from: _voter}),
                           "Vous ne pouvez pas ne rien proposer");
      });

      it("Should add one proposal", async function () {
        const expected = "Foo";
        await votingInstance.addProposal(expected, {from: _voter})
        const proposal  = await votingInstance.getOneProposal(new BN(1), {from: _voter});
        expect(proposal.description.toString()).to.equal(expected);
      });

      it("Should add two proposals", async function () {
        await votingInstance.addProposal("Foo", {from: _voter})
        const expected = "Bar";
        await votingInstance.addProposal(expected, {from: _voter})
        const proposal  = await votingInstance.getOneProposal(new BN(2), {from: _voter});
        expect(proposal.description.toString()).to.equal(expected);
      });
    });
    
    describe("Events", function () {
      it("Should emit an event: \"ProposalRegistered\"", async function () {
        expectEvent(await votingInstance.addProposal("Foo", {from: _voter}),
                    'ProposalRegistered',
                    {proposalId: new BN(1)});
      });
    });
  });

  describe("setVote", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.addVoter(_voter);
      await votingInstance.addVoter(_otherVoter);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal("Foo", {from: _voter});
      await votingInstance.addProposal("Bar", {from: _voter});
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from a voter", async function () {
        await expectRevert(votingInstance.setVote(new BN(1), {from: _owner}),
                           "You're not a voter");
      });

      it("Should revert with right error if voter has already vote", async function () {
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        await expectRevert(votingInstance.setVote(_proposalId, {from: _voter}),
                           "You have already voted");
      });

      it("Should revert with right error if voter vote for an inexisting proposal", async function () {
        const _proposalId = new BN(10)
        await expectRevert(votingInstance.setVote(_proposalId, {from: _voter}),
                           "Proposal not found");
      });

      it("Should set one vote", async function () {
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        const proposal  = await votingInstance.getOneProposal(_proposalId, {from: _voter});
        expect(proposal.voteCount).to.be.bignumber.equal(new BN(1));
      });

      it("Should set two votes for the same proposal", async function () {
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        await votingInstance.setVote(_proposalId, {from: _otherVoter});
        const proposal  = await votingInstance.getOneProposal(_proposalId, {from: _voter});
        expect(proposal.voteCount).to.be.bignumber.equal(new BN(2));
      });

      it("Should set 1 vote for each proposal", async function () {
        const _proposalId0 = new BN(1);
        const _proposalId1 = new BN(2);
        await votingInstance.setVote(_proposalId0, {from: _voter});
        await votingInstance.setVote(_proposalId1, {from: _otherVoter});
        const proposal0  = await votingInstance.getOneProposal(_proposalId0, {from: _voter});
        const proposal1  = await votingInstance.getOneProposal(_proposalId1, {from: _otherVoter});
        expect(proposal0.voteCount).to.be.bignumber.equal(new BN(1));
        expect(proposal1.voteCount).to.be.bignumber.equal(new BN(1));
      });
    });
    
    describe("Events", function () {
      it("Should emit an event: \"Voted\"", async function () {
        const _proposalId = new BN(1);
        expectEvent(await votingInstance.setVote(_proposalId, {from: _voter}),
                    'Voted',
                    {voter: _voter, proposalId: _proposalId});
      });
    });
  });

  describe("Start proposals Registering", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.addVoter(_voter);
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.startProposalsRegistering({from: _voter}),
                           "Ownable: caller is not the owner");
      });

      it("Should push the \"GENESIS\" proposal ", async function () {
        await votingInstance.startProposalsRegistering();
        const genesisProposalID = new BN(0);
        const proposal = await votingInstance.getOneProposal(genesisProposalID, {from: _voter});
        expect(proposal.description.toString()).to.equal("GENESIS");
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        expectEvent(await votingInstance.startProposalsRegistering(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(0), newStatus: new BN(1)});
      });
    });
  });

  describe("End proposals Registering", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.startProposalsRegistering();
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.endProposalsRegistering({from: _voter}),
                           "Ownable: caller is not the owner");
      });
    });
    
    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        expectEvent(await votingInstance.endProposalsRegistering(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(1), newStatus: new BN(2)});
      });
    });
  });

  describe("Start voting session", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.startProposalsRegistering();
      await votingInstance.endProposalsRegistering();
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.startVotingSession({from: _voter}),
                           "Ownable: caller is not the owner");
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        expectEvent(await votingInstance.startVotingSession(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(2), newStatus: new BN(3)});
      });
    });
  });

  describe("End voting session", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.startProposalsRegistering();
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.endVotingSession({from: _voter}),
                           "Ownable: caller is not the owner");
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        expectEvent(await votingInstance.endVotingSession(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(3), newStatus: new BN(4)});
      });
    });
  });

  describe("Tally Votes", function () {
    beforeEach(async function() {
      votingInstance = await Voting.new({from: _owner});
      await votingInstance.addVoter(_voter);
      await votingInstance.addVoter(_otherVoter);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal("Foo", {from: _voter});
      await votingInstance.addProposal("Bar", {from: _voter});
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();      
    });

    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.tallyVotes({from: _voter}),
                           "Ownable: caller is not the owner");
      });

      it("Should winning proposalId equal 1", async function () {
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        await votingInstance.endVotingSession();
        await votingInstance.tallyVotes();
        
        const expected = _proposalId;
        const actual = await votingInstance.winningProposalID();
        expect(actual).to.be.bignumber.equal(expected);
      });

      it("Should winning proposalId equal 2", async function () {
        const _proposalId1 = new BN(2);
        await votingInstance.setVote(_proposalId1, {from: _voter});
        await votingInstance.setVote(_proposalId1, {from: _otherVoter});
        await votingInstance.endVotingSession();
        await votingInstance.tallyVotes();

        const expected = _proposalId1;
        const actual = await votingInstance.winningProposalID();
        expect(actual).to.be.bignumber.equal(expected);
      });

      it("Should winning proposalId equal 1 even if there is a draw", async function () {
        const _proposalId0 = new BN(1);
        const _proposalId1 = new BN(2);
        await votingInstance.setVote(_proposalId0, {from: _voter});
        await votingInstance.setVote(_proposalId1, {from: _otherVoter});
        await votingInstance.endVotingSession();
        await votingInstance.tallyVotes();

        const expected = _proposalId0;
        const actual = await votingInstance.winningProposalID();
        expect(actual).to.be.bignumber.equal(expected);
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        await votingInstance.endVotingSession();
        expectEvent(await votingInstance.tallyVotes(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(4), newStatus: new BN(5)});
      });
    });
  });

  let VotingMock = artifacts.require("VotingMock");
  describe("WorkflowStatus access", function () {
    beforeEach(async function() {
      votingMockInstance = await VotingMock.new({from: _owner});
    });

    it("Add voter", async function () {
      const state = [new BN(1), new BN(2), new BN(3), new BN(4), new BN(5)]
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);
        await expectRevert(votingMockInstance.addVoter(accounts[i], {from: _owner}),
                           'Voters registration is not open yet');
      }
    });

    it("Add proposal", async function () {
      await votingMockInstance.addVoter(_voter, {from: _owner});
      const state = [new BN(0), new BN(2), new BN(3), new BN(4), new BN(5)]
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);
        await expectRevert(votingMockInstance.addProposal("Foo", {from: _voter}),
                           'Proposals are not allowed yet');
      }
    });

    it("Set vote", async function () {
      for (let i = 0; i < 6; i++) {
        await votingMockInstance.addVoter(accounts[i], {from: _owner});
      }
      
      const state = [new BN(0), new BN(1), new BN(2), new BN(4), new BN(5)];
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);
        await expectRevert(votingMockInstance.setVote(new BN(0), {from: accounts[i]}),
                           'Voting session havent started yet');
      };
    });

    it("Start proposals registering", async function () {
      const state = [new BN(1), new BN(2), new BN(3), new BN(4), new BN(5)];
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);      
        await expectRevert(votingMockInstance.startProposalsRegistering(),
                           'Registering proposals cant be started now');
      };
    });

    it("End proposals registering", async function () {
      const state = [new BN(0), new BN(2), new BN(3), new BN(4), new BN(5)]
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);            
        await expectRevert(votingMockInstance.endProposalsRegistering(),
                           'Registering proposals havent started yet');
      };
    });

    it("Start voting session", async function () {
      const state = [new BN(0), new BN(1), new BN(3), new BN(4), new BN(5)]
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);
        await expectRevert(votingMockInstance.startVotingSession(),
                           'Registering proposals phase is not finished');
      }
    });

    it("End voting session", async function () {
      const state = [new BN(0), new BN(1), new BN(2), new BN(4), new BN(5)]
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);
        await expectRevert(votingMockInstance.endVotingSession(),
                           'Voting session havent started yet');
      };
    });

    it("Tally votes", async function () {
      const state = [new BN(0), new BN(1), new BN(2), new BN(3), new BN(5)]
      for (const i of state) {
        await votingMockInstance.setWorkflowStatus(i);            
        await expectRevert(votingMockInstance.tallyVotes(),
                           "Current status is not voting session ended");
      };
    });
  });
  
});
