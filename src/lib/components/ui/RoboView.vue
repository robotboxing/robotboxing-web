<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-skeleton-loader
        class="mx-auto"
        :max-width="size"
        type="image"
        v-if="isLoad"
      ></v-skeleton-loader>
      <v-img
        class="mx-auto"
        v-bind="attrs"
        v-on="on"
        :width="width"
        :src="
          `https://dynamic-robot.herokuapp.com/${stars}/${name.toLowerCase()}`
        "
        @load="load"
      ></v-img>
    </template>
    <span>{{ name.toLowerCase() }}</span>
  </v-tooltip>
</template>

<script>
export default {
  props: ["stars", "name", "size"],

  data() {
    return {
      isLoad: true,
    };
  },

  computed: {
    width() {
      return this.size || 424;
    },
  },

  watch: {
    name() {
      this.isLoad = true;
    },
    stars() {
      this.isLoad = true;
    },
  },

  methods: {
    load() {
      this.isLoad = false;
    },
  },
};
</script>
