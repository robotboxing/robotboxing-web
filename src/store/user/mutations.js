import Vue from 'vue';

export default {
  setAccount: (state, account) => {
    state.account = account;
  },
  
  setIsConnected: (state, isConnected) => {
    state.isConnected = isConnected;
  },

  setNetworkInfo: (state, networkInfo) => {
    state.networkInfo = networkInfo;
  },

  setContractAddress: (state, contractAddress) => {
    state.contractAddress = contractAddress;
  },
  
  markProposal: (state, { proposalId, marked }) => {
    if (state.markedProposals[proposalId] === undefined) {
      Vue.set(state.markedProposals, proposalId, marked ? 1 : undefined);
    } else {
      if (marked) {
        state.markedProposals[proposalId] = 1;
      } else {
        state.markedProposals[proposalId] = undefined;
      }
    }

    localStorage.setItem('markedProposals', JSON.stringify(state.markedProposals));
  }
}
