import Web3 from 'web3';
import Config from '@/lib/Config';

export default {
  disconnectFromMetaMask({ commit }) {
    commit('setIsConnected', false);
    commit('setAccount', '');
  },

  markProposal({ commit }, { proposalId, marked }) {
    commit('markProposal', { proposalId, marked });
  },

  async connectToMetaMask({ commit }) {
    const configure = async ({ commit }) => {
      const accounts = await window.ethereum.enable();
      const networkInfo = {
        id: await web3.eth.net.getId(),
        type: await web3.eth.net.getNetworkType(),
      };
  
      commit('setIsConnected', true);
      commit('setAccount', accounts[0]);
      commit('setNetworkInfo', networkInfo);
      commit('setContractAddress', Config.getSmartContractAddress(networkInfo.id))
    };
  
    const clear = ({ commit }) => {
      commit('setIsConnected', false);
      commit('setAccount', null);
      commit('setNetworkInfo', {});
      commit('setContractAddress', '');
    };

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);

      window.ethereum.on('accountsChanged', (accounts) => {
        configure({commit});
      });
      
      window.ethereum.on('networkChanged', (networkId) => {
        window.location.reload();
      });

      ethereum.on('disconnect', () => {
        clear({commit});
      });
      
      try {
        configure({commit});        
        // await window.ethereum.request({
        //   method: "wallet_requestPermissions",
        //   params: [
        //     {
        //       eth_accounts: {}
        //     }
        //   ]
      } catch (e) {
        clear({commit});
      }
    } else {
      clear({commit});
    }
  },
}
