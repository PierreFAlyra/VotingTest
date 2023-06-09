// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;
import "../contracts/Voting.sol";

contract VotingMock is Voting {
    
    function setWorkflowStatus(uint workflowStatusId) public {
        workflowStatus = WorkflowStatus(workflowStatusId);
    }
}
