<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      {{ parsedAmount }} {{ symbol }}
    </template>
    <span>{{ amount }}</span>
  </v-tooltip>
</template>

<script>
import { Decimal } from 'decimal.js';

export default {
  props: ['amount', 'decimals', 'symbol'],

  computed: {
    parsedAmount() {
      return new Decimal(this.amount)
      .dividedBy(Math.pow(
        10, 
        parseInt(this.decimals, 10)
      ))
      .toNumber();
    }
  }
}
</script>
