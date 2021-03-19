<template>
  <div>
    <v-progress-linear
      :color="color"
      height="10"
      :value="value"
      striped
    ></v-progress-linear>
  </div>
</template>

<script>
import { Decimal } from 'decimal.js';

export default {
  props: ['minimumQuorum', 'weight', 'totalSupply'],

  computed: {
    value() {
      const proportion = new Decimal(this.weight).dividedBy(this.totalSupply);
      return proportion * 100;
    },

    color() {
      if (this.value >= 100) return 'success';
      if (this.value >= 80) return 'info';
      if (this.value >= 60) return 'warning';
      
      return 'error';
    }
  }
}
</script>
