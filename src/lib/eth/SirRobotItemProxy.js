import SirRobotItem from "./SirRobotItem.json";
import store from "@/store";

export default class SirRobotItemProxy {
  constructor() {
    this.contractAddress = store.getters["user/contractAddress"];
    this.smc = new window.web3.eth.Contract(
      SirRobotItem.output.abi,
      this.contractAddress
    );
  }

  weiToEther(weiAmount) {
    return window.web3.utils.fromWei(weiAmount.toString(), "ether");
  }

  etherToWei(etherAmount) {
    return window.web3.utils.toWei(etherAmount.toString());
  }

  getRobotByName(name) {
    return this.smc.methods.getRobotByName(name).call();
  }

  async getLastBidByStar(star) {
    const amount = await this.smc.methods.getLastBidByStar(star).call();

    return parseFloat(this.weiToEther(amount));
  }

  async getMinBidByStar(star) {
    const amount = await this.smc.methods.getMinBidByStar(star).call();

    return parseFloat(this.weiToEther(amount));
  }

  countRobots(account) {
    return this.smc.methods.balanceOf(account).call();
  }

  tokenOfOwnerByIndex(account, index) {
    return this.smc.methods.tokenOfOwnerByIndex(account, index).call();
  }

  getRobotUriByStarAndIndex(star, index) {
    return this.smc.methods.getRobotUriByStarAndIndex(star, index).call();
  }

  tokenURI(index) {
    return this.smc.methods.tokenURI(index).call();
  }

  async mintRobot({ name, star, amount, tokenURI }, account) {
    var getName = await this.getRobotByName(name);
    var getStar = await this.getMinBidByStar(star);
    console.log(getName);
    console.log(getStar);

    if (parseInt(getName) !== 0) {
      throw {
        status: 409,
        code: "NAME_REGISTERED",
      };
    }
    if (getStar >= parseFloat(amount)) {
      throw {
        status: 409,
        code: "INVALID_MIN_AMOUNT",
      };
    }

    const from = account;
    const nonce = window.web3.utils.toHex(
      await window.web3.eth.getTransactionCount(account)
    );
    const to = this.contractAddress;

    console.log({
      name,
      star,
      tokenURI,
    });

    const txObject = {
      from,
      nonce,
      value: window.web3.utils.toHex(this.etherToWei(amount)),
      to,
      data: this.smc.methods.mintRobot(name, star, tokenURI).encodeABI(),
    };

    return new Promise((resolve, reject) => {
      window.web3.eth.sendTransaction(txObject, (error, hash) => {
        if (error) {
          reject(error);
        } else {
          resolve(hash);
        }
      });
    });
  }
}
