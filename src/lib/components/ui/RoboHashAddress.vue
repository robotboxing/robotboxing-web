<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <a :href="`https://ropsten.etherscan.io/address/${address}`" target="_blank">
        <v-img 
            v-bind="attrs"
            v-on="on"
            :width="width" 
            :height="width" 
            :src="`https://robohash.org/${address.toLowerCase()}?set=set1`"
        ></v-img>
      </a>
    </template>
    <span>{{ address }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: ['address', 'size'],

  computed: {
    width() {
      return this.size || 32;
    }
  }
}
</script>
