# Projet 2 - Test du Système de vote

Le projet consiste à tester le contrat Voting.sol.

## Pour Commencer

Ces instructions vous permettront d'obtenir une copie du projet sur votre ordinateur local à des fins de développement et de test.

### Prérequis

Il a été réalisé depuis le framework Truffle.
```
npm install -g truffle
```

### Installation des deps

Il comporte les dépendances suivantes:
```
npm install --save-dev  @openzeppelin/contracts @openzeppelin/test-helpers @truffle/hdwallet-provider dotenv eth-gas-reporter
```

## Tests

### Pour commencer

Pour faire tourner les tests:
```
truffle test
```

### Description des tests

Il y a 76 tests unitaires.
Chaque fonction "public/external" est testé séparemment en suivant un template simple:
* description de la fonction testé
* Une sous-section "Validation":
  * Check des requires
  * Check du "state"
  * Check de ces valeurs de retour ou modification de variables global
* Une sous-section "Events"
  * Check des events

### Gas Report


|  Solc version: 0.8.13+commit.abaa5c0e     |  Optimizer enabled: false  |  Runs: 200  |  Block limit: 6718946 gas  │
|-------------------------------------------|----------------------------|-------------|----------------------------|
|  Methods                                                                                                          │
|             |                             |              |             |             |              |             |
|  Contract   |  Method                     |  Min         |  Max        |  Avg        |  # calls     |  eur (avg)  │
|-------------|-----------------------------|--------------|-------------|-------------|--------------|-------------|
|  Voting     |   addProposal               |              |             |       59004 |           19 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |   addVoter                  |              |             |       50220 |           42 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |  endProposalsRegistering    |              |             |       30599 |           50 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |  endVotingSession           |              |             |       30533 |           28 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |  setVote                    |        60913 |       78013 |       74995 |           17 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |  startProposalsRegistering  |              |             |       94840 |           63 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |  startVotingSession         |              |             |       30554 |           43 |             │
|             |                             |              |             |             |              |             | 
|  Voting     |  tallyVotes                 |        37849 |       63565 |       44305 |           23 |             │
|             |                             |              |             |             |              |             | 
|  Deployments|                             |              |             |             |   % of limit |             │
|             |                             |              |             |             |              |             | 
|  Voting     |                             |              |             |     1970595 |       29.3 % |             │


### Code-Coverage

Le coverage a été testé depuis HardHat.
Grace à hardhat-truffle5 le code coverage à pu être réalisé.


|File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|-------------|----------|----------|----------|----------|----------------|
| contracts/  |      100 |      100 |      100 |      100 |                |
|  Lock.sol   |      100 |      100 |      100 |      100 |                |
|  Voting.sol |      100 |      100 |      100 |      100 |                |
|             |          |          |          |          |                |
|All files    |      100 |      100 |      100 |      100 |                |


Note: Si le contrat Lock.sol n'est pas compilé et testé le code coverage indique des valeurs erronées.






