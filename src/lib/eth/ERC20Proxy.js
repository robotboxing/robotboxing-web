import ERC20 from './ERC20.json';

export default class ERC20Proxy {
	constructor(contractAddress) {
		this.contractAddress = contractAddress;
		this.smc = new window.web3.eth.Contract(ERC20.abi, contractAddress);
	}

  name() {
		return this.smc.methods.name().call();
  }
  
  symbol() {
		return this.smc.methods.symbol().call();
	}
  
  decimals() {
		return this.smc.methods.decimals().call();
	}
  
  totalSupply() {
		return this.smc.methods.totalSupply().call();
	}
  
  balanceOf(account) {
		return this.smc.methods.balanceOf(account).call();
  }
  
  async getInfo(account) {
    const info = {};
    let found = false;

    try {
      info.totalSupply = await this.totalSupply();
      found = true;
    } catch (e) {
      info.totalSupply = 'N/D';
    }

    try {
      info.name = await this.name();
      found = true;
    } catch (e) {
      info.name = 'N/D';
    }

    try {
      info.symbol = await this.symbol();
      found = true;
    } catch (e) {
      info.symbol = 'N/D';
    }

    try {
      info.decimals = await this.decimals();
      found = true;
    } catch (e) {
      info.decimals = 'N/D';
    }

    try {
      info.balanceOf = await this.balanceOf(account);
      found = true;
    } catch (e) {
      info.balanceOf = 'N/D';
    }

    info.contractAddress = this.contractAddress;
    info.found = found;

    return info;
  }
}