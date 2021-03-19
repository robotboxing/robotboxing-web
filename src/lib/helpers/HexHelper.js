
  

let defaultNode;

export default class HexHelper {
  static get32BytesHexValue(type, value) {
    switch(type) {
      case 'uint256':
        const intValue = parseInt(value, 10);
        return '0x' + web3.utils.padLeft(new web3.utils.BN(intValue).toString(16), 64);
      case 'bool':
        const boolValue = value === 'true' || value === 'yes' || value === '1' ? 1 : 0;
        return '0x' + web3.utils.padLeft(new web3.utils.BN(boolValue).toString(16), 64);
      case 'address':
        const addressValue = value || '';
        return '0x' + web3.utils.padLeft(addressValue.replace('0x', ''), 64);
      case 'string':
        const stringValue = value || '';
        return '0x' + web3.utils.padLeft(web3.utils.toHex(stringValue).substr(2, 64), 64);
      default:
        return '0x' + web3.utils.padLeft((value || '').substr(0, 64), 64);
    }
  }

  static getOnlyValues(items) {
    return items.map(item => HexHelper.get32BytesHexValue(item.type, item.value));
  }
}