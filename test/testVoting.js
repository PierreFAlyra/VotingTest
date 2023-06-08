const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const constants = require('@openzeppelin/test-helpers/src/constants');

contract("Voting", accounts => {

  let Voting = artifacts.require("Voting");

  const _owner = accounts[0];
  const _voter = accounts[1];
  const _otherVoter = accounts[2];

  let votingInstance;
  beforeEach(async function() {
    votingInstance = await Voting.new({from: _owner});
  });

  describe("Deployement", function () {
    describe("Constructor", function () {
      it("Should set the right owner", async function () {
        expect(await votingInstance.owner()).to.equal(_owner);
      });
    });

    describe("Initalization", function () {
      it("Should init workflowstatus to RegisteringVoters", async function () {
        const workflowStatus = await votingInstance.workflowStatus();
        expect(workflowStatus).to.be.bignumber.equal('0');
      });

      it("Should init winningProposalId to 0", async function () {
        const winningProposalID = await votingInstance.winningProposalID();
        expect(winningProposalID).to.be.bignumber.equal('0');
      });
    });
  });

  describe("Getters access", function () {
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
    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.addVoter(_voter, {from: _voter}),
                           "Ownable: caller is not the owner");
      });

      // The only way to change workFlowStatus value... (Mock will be helpful)
      describe("State", async function () {
        it("Should revert with right error if called from \"ProposalsRegistrationStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await expectRevert(votingInstance.addVoter(_voter),
                             "Voters registration is not open yet");
        });
        
        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.addVoter(_voter),
                             "Voters registration is not open yet");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await expectRevert(votingInstance.addVoter(_voter),
                             "Voters registration is not open yet");
        });

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.addVoter(_voter),
                             "Voters registration is not open yet");
        });
        
        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.addVoter(_voter),
                             "Voters registration is not open yet");
        });
      });

      it("Should revert with right error if register multiple times from the same account", async function () {
        await votingInstance.addVoter(_voter);
        await expectRevert(votingInstance.addVoter(_voter),
                           "Already registered");
      });

      it("Should register one voter", async function () {
        await votingInstance.addVoter(_voter);
        const voter  = await votingInstance.getVoter(_voter, {from: _voter});
        expect(voter.isRegistered.toString()).to.equal("true");
      });

      it("Should register two voters", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.addVoter(_otherVoter);
        const voter  = await votingInstance.getVoter(_otherVoter, {from: _voter});
        expect(voter.isRegistered.toString()).to.equal("true");
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
    describe("Validations", function () {
      it("Should revert with right error if not called from a voter", async function () {
        await votingInstance.addVoter(_voter);
        await expectRevert(votingInstance.addProposal("", {from: _owner}),
                           "You're not a voter");
      });

      // The only way to change workFlowStatus value... (Mock will be helpful)
      describe("State", async function () {
        it("Should revert with right error if called from \"RegisteringVoters\"", async function () {
          await votingInstance.addVoter(_voter);
          await expectRevert(votingInstance.addProposal("", {from: _voter}),
                             "Proposals are not allowed yet");
        });
        
        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.addProposal("", {from: _voter}),
                             "Proposals are not allowed yet");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await expectRevert(votingInstance.addProposal("", {from: _voter}),
                             "Proposals are not allowed yet");
        });

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.addProposal("", {from: _voter}),
                             "Proposals are not allowed yet");
        });
        
        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.addProposal("", {from: _voter}),
                             "Proposals are not allowed yet");
        });
      });

      it("Should revert with right error if the description is empty", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await expectRevert(votingInstance.addProposal("", {from: _voter}),
                           "Vous ne pouvez pas ne rien proposer");
      });

      it("Should add one proposal", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        const expected = "Foo";
        await votingInstance.addProposal(expected, {from: _voter})
        const proposal  = await votingInstance.getOneProposal(new BN(1), {from: _voter});
        expect(proposal.description.toString()).to.equal(expected);
      });

      it("Should add two proposals", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter})
        const expected = "Bar";
        await votingInstance.addProposal(expected, {from: _voter})
        const proposal  = await votingInstance.getOneProposal(new BN(2), {from: _voter});
        expect(proposal.description.toString()).to.equal(expected);
      });
    });
    
    describe("Events", function () {
      it("Should emit an event: \"ProposalRegistered\"", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        expectEvent(await votingInstance.addProposal("Foo", {from: _voter}),
                    'ProposalRegistered',
                    {proposalId: new BN(1)});
      });
    });
  });

  describe("setVote", function () {
    describe("Validations", function () {
      it("Should revert with right error if not called from a voter", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        await expectRevert(votingInstance.setVote(new BN(1), {from: _owner}),
                           "You're not a voter");
      });

      // The only way to change workFlowStatus value... (Mock will be helpful)
      describe("State", async function () {
        it("Should revert with right error if called from \"RegisteringVoters\"", async function () {
          await votingInstance.addVoter(_voter);
          await expectRevert(votingInstance.setVote(new BN(1), {from: _voter}),
                             "Voting session havent started yet");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationStarted\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await expectRevert(votingInstance.setVote(new BN(1), {from: _voter}),
                             "Voting session havent started yet");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.setVote(new BN(1), {from: _voter}),
                             "Voting session havent started yet");
        });        

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.setVote(new BN(1), {from: _voter}),
                             "Voting session havent started yet");
        });
        
        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.addVoter(_voter);
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.setVote(new BN(1), {from: _voter}),
                             "Voting session havent started yet");
        });
      });

      it("Should revert with right error if voter has already vote", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter});
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        await expectRevert(votingInstance.setVote(_proposalId, {from: _voter}),
                           "You have already voted");
      });

      it("Should revert with right error if voter vote for an inexisting proposal", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter});
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        const _proposalId = new BN(10)
        await expectRevert(votingInstance.setVote(_proposalId, {from: _voter}),
                           "Proposal not found");
      });

      it("Should set one vote", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter});
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        const proposal  = await votingInstance.getOneProposal(_proposalId, {from: _voter});
        expect(proposal.voteCount).to.be.bignumber.equal('1');
      });

      it("Should set two votes for the same proposal", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.addVoter(_otherVoter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter});
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        const _proposalId = new BN(1);
        await votingInstance.setVote(_proposalId, {from: _voter});
        await votingInstance.setVote(_proposalId, {from: _otherVoter});
        const proposal  = await votingInstance.getOneProposal(_proposalId, {from: _voter});
        expect(proposal.voteCount).to.be.bignumber.equal('2');
      });

      it("Should set 1 vote for each proposal", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.addVoter(_otherVoter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter});
        await votingInstance.addProposal("Bar", {from: _voter});
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        const _proposalId0 = new BN(1);
        const _proposalId1 = new BN(2);
        await votingInstance.setVote(_proposalId0, {from: _voter});
        await votingInstance.setVote(_proposalId1, {from: _otherVoter});
        const proposal0  = await votingInstance.getOneProposal(_proposalId0, {from: _voter});
        const proposal1  = await votingInstance.getOneProposal(_proposalId1, {from: _otherVoter});
        expect(proposal0.voteCount).to.be.bignumber.equal('1');
        expect(proposal1.voteCount).to.be.bignumber.equal('1');
      });
    });
    
    describe("Events", function () {
      it("Should emit an event: \"Voted\"", async function () {
        await votingInstance.addVoter(_voter);
        await votingInstance.startProposalsRegistering();
        await votingInstance.addProposal("Foo", {from: _voter});
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        const _proposalId = new BN(1);
        expectEvent(await votingInstance.setVote(_proposalId, {from: _voter}),
                    'Voted',
                    {voter: _voter, proposalId: _proposalId});
      });
    });
  });

  describe("Start proposals Registering", function () {
    describe("Validations", function () {

      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.startProposalsRegistering({from: _voter}),
                           "Ownable: caller is not the owner");
      });

      describe("State", async function () {
        it("Should revert with right error if called from \"ProposalsRegistrationStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await expectRevert(votingInstance.startProposalsRegistering(),
                             "Registering proposals cant be started now");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.startProposalsRegistering(),
                             "Registering proposals cant be started now");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await expectRevert(votingInstance.startProposalsRegistering(),
                             "Registering proposals cant be started now");
        });

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.startProposalsRegistering(),
                             "Registering proposals cant be started now");
        });

        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.startProposalsRegistering(),
                             "Registering proposals cant be started now");
        });
      });

      it("Should ", async function () {
        await votingInstance.addVoter(_voter);
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
    describe("Validations", function () {

      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.endProposalsRegistering({from: _voter}),
                           "Ownable: caller is not the owner");
      });

      describe("State", async function () {
        it("Should revert with right error if called from \"RegisteringVoters\"", async function () {
          await expectRevert(votingInstance.endProposalsRegistering(),
                             "Registering proposals havent started yet");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.endProposalsRegistering(),
                             "Registering proposals havent started yet");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await expectRevert(votingInstance.endProposalsRegistering(),
                             "Registering proposals havent started yet");
        });

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.endProposalsRegistering(),
                             "Registering proposals havent started yet");
        });

        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.endProposalsRegistering(),
                             "Registering proposals havent started yet");
        });
      });
    });
    
    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        await votingInstance.startProposalsRegistering();
        expectEvent(await votingInstance.endProposalsRegistering(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(1), newStatus: new BN(2)});
      });
    });
  });

  describe("Start voting session", function () {
    describe("Validations", function () {

      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.startVotingSession({from: _voter}),
                           "Ownable: caller is not the owner");

      });

      describe("State", async function () {
        it("Should revert with right error if called from \"RegisteringVoters\"", async function () {
          await expectRevert(votingInstance.startVotingSession(),
                             "Registering proposals phase is not finished");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await expectRevert(votingInstance.startVotingSession(),
                             "Registering proposals phase is not finished");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await expectRevert(votingInstance.startVotingSession(),
                             "Registering proposals phase is not finished");
        });

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.startVotingSession(),
                             "Registering proposals phase is not finished");
        });

        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.startVotingSession(),
                             "Registering proposals phase is not finished");
        });
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        await votingInstance.startProposalsRegistering();
        await votingInstance.endProposalsRegistering();
        expectEvent(await votingInstance.startVotingSession(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(2), newStatus: new BN(3)});
      });
    });
  });

  describe("End voting session", function () {
    describe("Validations", function () {

      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.endVotingSession({from: _voter}),
                           "Ownable: caller is not the owner");
        
      });

      describe("State", async function () {
        it("Should revert with right error if called from \"RegisteringVoters\"", async function () {
          await expectRevert(votingInstance.endVotingSession(),
                             "Voting session havent started yet");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await expectRevert(votingInstance.endVotingSession(),
                             "Voting session havent started yet");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.endVotingSession(),
                             "Voting session havent started yet");
        });

        it("Should revert with right error if called from \"VotingSessionEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await expectRevert(votingInstance.endVotingSession(),
                             "Voting session havent started yet");
        });

        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.endVotingSession(),
                             "Voting session havent started yet");
        });
      });
    });

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        await votingInstance.startProposalsRegistering();
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        expectEvent(await votingInstance.endVotingSession(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(3), newStatus: new BN(4)});
      });
    });
  });

  describe("Tally Votes", function () {
    describe("Validations", function () {
      it("Should revert with right error if not called from the owner", async function () {
        await expectRevert(votingInstance.tallyVotes({from: _voter}),
                           "Ownable: caller is not the owner");
      });

      describe("State", async function () {
        it("Should revert with right error if called from \"RegisteringVoters\"", async function () {
          await expectRevert(votingInstance.tallyVotes(),
                             "Current status is not voting session ended");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await expectRevert(votingInstance.tallyVotes(),
                             "Current status is not voting session ended");
        });

        it("Should revert with right error if called from \"ProposalsRegistrationEnded\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await expectRevert(votingInstance.tallyVotes(),
                             "Current status is not voting session ended");
        });

        it("Should revert with right error if called from \"VotingSessionStarted\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await expectRevert(votingInstance.tallyVotes(),
                             "Current status is not voting session ended");
        });

        it("Should revert with right error if called from \"VotesTallied\"", async function () {
          await votingInstance.startProposalsRegistering();
          await votingInstance.endProposalsRegistering();
          await votingInstance.startVotingSession();
          await votingInstance.endVotingSession();
          await votingInstance.tallyVotes();
          await expectRevert(votingInstance.tallyVotes(),
                             "Current status is not voting session ended");
        });
      });
    });

    it("Should winning proposalId equal 1", async function () {
      await votingInstance.addVoter(_voter);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal("Foo", {from: _voter});
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
      const _proposalId = new BN(1);
      await votingInstance.setVote(_proposalId, {from: _voter});
      await votingInstance.endVotingSession();
      await votingInstance.tallyVotes();
      
      const expected = _proposalId;
      const actual = await votingInstance.winningProposalID();
      expect(actual).to.be.bignumber.equal(expected);
    });

    it("Should winning proposalId equal 2", async function () {
      await votingInstance.addVoter(_voter);
      await votingInstance.addVoter(_otherVoter);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal("Foo", {from: _voter});
      await votingInstance.addProposal("Bar", {from: _voter});
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
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
      await votingInstance.addVoter(_voter);
      await votingInstance.addVoter(_otherVoter);
      await votingInstance.startProposalsRegistering();
      await votingInstance.addProposal("Foo", {from: _voter});
      await votingInstance.addProposal("Bar", {from: _voter});
      await votingInstance.endProposalsRegistering();
      await votingInstance.startVotingSession();
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

    describe("Events", function () {
      it("Should emit an event: \"WorkflowStatusChange\"", async function () {
        await votingInstance.startProposalsRegistering();
        await votingInstance.endProposalsRegistering();
        await votingInstance.startVotingSession();
        await votingInstance.endVotingSession();
        expectEvent(await votingInstance.tallyVotes(),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(4), newStatus: new BN(5)});
      });
    });
  });
});
