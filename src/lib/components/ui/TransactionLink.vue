<template>
  <a :href="`http://ropsten.etherscan.io/tx/${transactionHash}`" target="_blank">
    {{ transactionHash }}
  </a>
</template>

<script>
export default {
  props: ['transactionHash'],
}
</script>
