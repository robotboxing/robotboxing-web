<template>
  <span>
    {{ parsedMinimumQuorum }}
  </span>
</template>

<script>
export default {
  props: ['minimumQuorum'],

  computed: {
    parsedMinimumQuorum() {
      const text = [
        '60 %',
        '70 %',
        '80 %',
        '90 %',
        '100 %',
      ];

      return text[this.minimumQuorum];
    }
  }
}
</script>
