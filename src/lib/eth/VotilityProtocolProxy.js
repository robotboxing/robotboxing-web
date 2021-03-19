import VotilityProtocol from './VotilityProtocol.json';
import store from '@/store';

export default class VotilityProtocolProxy {
  constructor() {
    this.contractAddress = store.getters['user/contractAddress'];
		this.smc = new window.web3.eth.Contract(VotilityProtocol.abi, this.contractAddress);
	}

	async getProposal(proposalId) {
		const r = await this.smc.methods.getProposal(proposalId).call();

		return {
			id: parseInt(r['0'], 10),
			data: parseInt(r['1'], 10),
			ipfsData: r['2'],
			erc20VotingPower: r['3'],
			targetContract: r['4'],
			votingOwner: r['5'],
			blockLimit: parseInt(r['6'], 10),
			options: r['7'].map(option => parseInt(option, 10)),
			onChain: r['8'],
			snapshotId: parseInt(r['9'], 10),
			isFinished: r['10'],
			minimumQuorum: parseInt(r['11'], 10),
		};
	}

	getProposalWeight(proposalId) {
		return this.smc.methods.getProposalWeight(proposalId).call();
	}

	getVotesWeight(proposalId, optionIndex) {
		return this.smc.methods.getVotesWeight(proposalId, optionIndex).call();
	}

	async getNewProposalEvents(proposalId) {
		const events = await this.smc.getPastEvents('NewProposal',
			{
				fromBlock: 0,
				toBlock: 'latest',
				filter: { proposalId },
			});
		
		return events.map(event => {
			return {
				transactionHash: event.transactionHash,
				blockHash: event.blockHash,
				blockNumber: event.blockNumber,
				owner: event.returnValues.owner,
				proposalId: event.returnValues.proposalId,
			}
		})
	}

	async getInfo() {
		return {
			count: await this.getProposalsCount(),
			finished: await this.getFinishedProposalsCount(),
			burntTokens: await this.getBurntTokens(),
			votes: await this.getVotes(),
		}
	}

	async getFinishedProposalsCount() {
		return this.smc.methods.getFinishedProposalsCount().call();
	}

	async getVotes() {
		return this.smc.methods.getVotes().call();
	}

	async getBurntTokens() {
		return 0;
	}

	async getProposalsCount() {
		return this.smc.methods.getProposalsCount().call();
	}

	async getProposals(pageLimit, page) {
		const count = await this.getProposalsCount();
		const start = count - pageLimit * page;

		const promises = [];

		for (let i = start; i > (start - pageLimit) && i > 0; i--) {
			promises.push(this.getProposal(i-1));
		}

		return Promise.all(promises);
	}

	events() {
		return this.smc.events;
	}

	async getNewVoteEvents(fromBlock, proposalId) {
		const events = await this.smc.getPastEvents('NewVote',
			{
				fromBlock,
				toBlock: 'latest',
				filter: { proposalId },
			});
		
		return events.map(event => {
			return {
				transactionHash: event.transactionHash,
				blockHash: event.blockHash,
				blockNumber: event.blockNumber,
				optionIndex: event.returnValues.optionIndex,
				optionValue: event.returnValues.optionValue,
				voter: event.returnValues.voter,
				proposalId: event.returnValues.proposalId,
				weight: event.returnValues.weight,
			}
		})
	}

	async addProposal({
		data,
		ipfsData, 
		erc20VotingPower, 
		targetContract, 
		blockLimit, 
		options, 
		onChain, 
		snapshotId,
		minimumQuorum,
	}, account) {
		const from = account;
		const nonce = window.web3.utils.toHex(await window.web3.eth.getTransactionCount(account));
		const to = this.contractAddress;

		console.log({
			data,
			ipfsData,
			erc20VotingPower,
			targetContract,
			blockLimit,
			options,
			onChain,
			snapshotId,
			minimumQuorum,
		});

		const txObject = {
			from,
			nonce,
			value: '0x0',
			to,
			data: this.smc.methods.addProposal(
				data,
				ipfsData,
				erc20VotingPower,
				targetContract,
				blockLimit,
				options,
				onChain,
				snapshotId,
				minimumQuorum,
			).encodeABI(),
		};

		return new Promise((resolve, reject) => {
			window.web3.eth.sendTransaction(txObject, (error, hash) => {
				if (error) {
					reject(error)
				} else {
					resolve(hash);
				}
			})
		})
	}

	async vote({proposalId, option}, account) {
		const from = account;
		const nonce = window.web3.utils.toHex(await window.web3.eth.getTransactionCount(account));
		const to = this.contractAddress;
		
		const data = this.smc.methods.vote(
			proposalId,
			option,
		).encodeABI();

		const txObject = {
			from,
			nonce,
			value: '0x0',
			to,
			data,
		};

		return new Promise((resolve, reject) => {
			window.web3.eth.sendTransaction(txObject, (error, hash) => {
				if (error) {
					reject(error)
				} else {
					resolve(hash);
				}
			})
		})
	}

	async finish(proposalId, account) {
		const from = account;
		const nonce = window.web3.utils.toHex(await window.web3.eth.getTransactionCount(account));
		const to = this.contractAddress;
		
		const data = this.smc.methods.finish(proposalId).encodeABI();

		const txObject = {
			from,
			nonce,
			value: '0x0',
			to,
			data,
		};

		return new Promise((resolve, reject) => {
			window.web3.eth.sendTransaction(txObject, (error, hash) => {
				if (error) {
					reject(error)
				} else {
					resolve(hash);
				}
			})
		})
	}
}