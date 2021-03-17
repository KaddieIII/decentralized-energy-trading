---
noteId: "1e61fc70226911ea85c0fd637b375b0e"
tags: []

---

# Privacy-Preserving Netting in Local Energy Grids

This is a prototype that connects [BloGPV](https://github.com/JacobEberhardt/decentralized-energy-trading) with [Energy Web Origin](https://github.com/energywebfoundation/origin).
It gives a prognosis whether or not the community in BloGPV should request certificates in Origin or not. Since this is part of my bachelor thesis and I don't have access to the full version of Origin, you cannot ask for certificates. The Demo-version of Origin doesn't support that function. So we skip this part at the moment and just simulate, that we already have these certificates.

## Requirements

* [Docker](https://docs.docker.com/get-docker/) >= v19.03.2
* [Node Version Manager](https://github.com/nvm-sh/nvm) >= 0.37.2
* [Node](https://nodejs.org/en/download/) - for BloGPV = v10.x.x >= v10.15.3 and for Origin >= v.12.x.x
* [Yarn](https://classic.yarnpkg.com/en/docs/install) >= v1.16
* [ZoKrates](https://github.com/Zokrates/ZoKrates) >= 0.5.0
* [Postgres](https://www.postgresql.org/download/) >= 12.x
* [Energy Web Origin](https://github.com/energywebfoundation/origin) = v1.2.10

## Get started

## Install EWO
1.) Tell NVM which Node-Version [Energy Web Origin](https://github.com/energywebfoundation/origin) needs

```
nvm use 12
```

2.) Install all [Energy Web Origin](https://github.com/energywebfoundation/origin)-Packages

3.) Setup Origin Database

```
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE origin"
```

4.) Make sure you have created a ```.env``` file in the root of the monorepo and that all necessary variables are set. Use [.env.example](https://github.com/energywebfoundation/origin/blob/master/.env.example) as an example of how the ```.env``` file should look.

5.) Make sure have latest ```yarn``` package manager installed.

```
yarn
```

6.) Build EWO

```
yarn build
```

7.) Test EWO

```
yarn test
```

## Install Prototype
**1.)** Install dependencies

```bash
yarn install
yarn --cwd household-ui/ install
```

**2.)** Setup ZoKrates contract

```bash
yarn setup-zokrates
yarn update-contract-bytecodes
```

**3.)** Start the ethereum parity chain:

```bash
cd parity-authority
docker-compose up -d --build
```

**ethstats** is available at: http://localhost:3001

**4.)** Configure the contracts using truffle migrations:

```bash
yarn migrate-contracts-authority
```

## Running the prototype


**1.)** Run EWO (root folder)

```
yarn run:origin
```
Visit the UI at: [http://localhost:3000](http://localhost:3000). Before registering in the Demo-Version, go to step 2.)

**2.)** Get the [MetaMask](https://metamask.io/download.html)-Extension for your Browser and get into the Test-Account with the mnemonic phrase: "wash elder couch enhance skin beyond body robust grief garage trumpet keep".

**2.)** When the EWO-UI is fully loaded, run in prototype-root-folder:

```
yarn fill-db
```

**3.)** Start the Netting Entity:

```bash
yarn run-netting-entity -i 60000
```

**4.)** Create two databases for both household servers:

```bash
# Assumes project root directory
docker-compose -f mongo/docker-compose.yml up -d
```

**5.)** Start two household servers:

```bash
# Household 1
yarn run-server \
  -a 0x00aa39d30f0d20ff03a22ccfc30b7efbfca597c2 \
  -P node1 -n authority_1 \
  -d mongodb://127.0.0.1:27011
```

```bash
# Household 2
yarn run-server -p 3003 \
  -a 0x002e28950558fbede1a9675cb113f0bd20912019 \
  -P node2 -n authority_2 \
  -d mongodb://127.0.0.1:27012
```

**Note:** Depending on your network settings an extra flag `-h 127.0.0.1` could be needed for both households.

**6.)** Start a mocked sensor for each household:

```bash
# Household 1 with positive energy balance
yarn run-sensor -p 3002 -e +
```

```bash
# Household 2 with negative energy balance
yarn run-sensor -p 3003 -e -
```

**7.)** Start two household-ui applications:

```bash
# Household 1
yarn --cwd household-ui/ start
```

```bash
# Household 2
REACT_APP_HSS_PORT=3003 \
 PORT=3010 \
 yarn --cwd household-ui/ start
```

## Tests

- `yarn test-contracts` to test contracts
- `yarn test-parity-docker` to test docker parity authority setup
- `yarn test-helpers` to test helper functions
- `yarn test-utility-js` to test off-chain utility functionality

## Benchmarks

- `yarn utility-benchmark` to benchmark the `settle` method of the `Utility` contract

## Development

- `yarn update-contract-bytecodes` to update the contracts code in the `chain.json` file
- `yarn setup-zokrates` to generate a new `Verifier` contract
- `yarn format-all` fix linting issues

## Smart contract and ZoKrates program generation:
- `yarn generate-prooving-files [# Prod] [# Cons]` generates required files for given number of producers and consumers
