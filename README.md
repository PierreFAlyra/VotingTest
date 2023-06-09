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

Il y a 44 tests unitaires.
Chaque fonction "public/external" est testé séparément en suivant un template simple:
* description de la fonction testé avec son contexte associé ("beforeEach")
* Une sous-section "Validation":
  * Check des requires
  * Check de ces valeurs de retour ou modification de variables globales
* Une sous-section "Events"
  * Check des events
  
Note: Un fichier VotingMock.sol a été rajouté pour permettre de tester plus simplement les requires de workflowStatus.

### Code-Coverage

Le coverage a été testé depuis HardHat. Utilisation de hardhat-truffle5.

|File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
|-------------|----------|----------|----------|----------|----------------|
| contracts/  |      100 |      100 |      100 |      100 |                |
|  Lock.sol   |      100 |      100 |      100 |      100 |                |
|  Voting.sol |      100 |      100 |      100 |      100 |                |
|             |          |          |          |          |                |
|All files    |      100 |      100 |      100 |      100 |                |


Note: Si le contrat Lock.sol n'est pas compilé et testé le code coverage indique des valeurs erronées.






