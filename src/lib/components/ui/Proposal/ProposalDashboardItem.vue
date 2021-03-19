<template>
  <v-card>
    <div>
      <v-skeleton-loader
        v-if="loading"
        type="list-item-two-line"
      ></v-skeleton-loader>
      <div v-else class="d-flex">
        <div class="pa-2">
          <div class="font-weight-bold">{{ title }}</div>
          <div class="secondary--text text-body-2 text-truncate">
            {{ value }}
            <slot></slot>                   
          </div>
        </div>
        <v-spacer></v-spacer>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  props: ['loading', 'title', 'value'],
}
</script>
