export const VOTILITY_PROTOCOL_SMC_ADDRESS = process.env.VUE_APP_VOTILITY_SMART_CONTRACT;
export const VUE_APP_VOTILITY_SMART_CONTRACT_3 = process.env.VUE_APP_VOTILITY_SMART_CONTRACT_3;
export const VUE_APP_VOTILITY_SMART_CONTRACT_5777 = process.env.VUE_APP_VOTILITY_SMART_CONTRACT_5777;
//export const VOTILITY_PROTOCOL_SMC_ADDRESS = '0xB354bede9f8dDb6A1E75548C28b94B25383A2c10';

export function getSmartContractAddress(networkId) {
  switch (networkId.toString()) {
    case '3':
      return VUE_APP_VOTILITY_SMART_CONTRACT_3;
    case '5777':
      return VUE_APP_VOTILITY_SMART_CONTRACT_5777;
    default: 
      return VOTILITY_PROTOCOL_SMC_ADDRESS;
  }
}

export default {
  VOTILITY_PROTOCOL_SMC_ADDRESS,
  getSmartContractAddress,
}