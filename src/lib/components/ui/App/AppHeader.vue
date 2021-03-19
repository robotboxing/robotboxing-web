<template>
  <v-app-bar
    app
    class="app-bar-full"
  >
    <v-card
      class="flex-grow-1 d-flex pa-1"
      tile
    >
      <div class="d-flex flex-grow-1 align-center">
        <router-link to="/" class="d-flex px-1 align-center logo">
          <img src="/images/project/logo-small.png" height="56" alt="logo" class="mr-1">
          <div>
            <div class="title font-weight-bold primary--text">SirRobot</div>
            <div class="overline grey--text">0.0.1-develop</div>
          </div>
        </router-link>

        <v-spacer></v-spacer>

        <div :class="[$vuetify.rtl ? 'ml-1' : 'mr-1']">
          <toolbar-notifications />
        </div>

        <toolbar-user @toggleNetworkInfo="toggleNetworkInfo" />
      </div>
    </v-card>

    <network-info-modal :open="networkInfoModalOpen" @close="closeNetworkInfoModal" />
  </v-app-bar>
</template>

<script>
import ToolbarNotifications from '@/lib/components/ui/Toolbar/ToolbarNotifications';
import ToolbarUser from '@/lib/components/ui/Toolbar/ToolbarUser';
import NetworkInfoModal from '@/lib/components/ui/Modals/NetworkInfoModal.vue';

export default {
  components: {
    ToolbarUser,
    ToolbarNotifications,
    NetworkInfoModal,
  },

  data () {
    return {
      networkInfoModalOpen: false,
    }
  },

  methods: {
    toggleNetworkInfo(open) {
      this.networkInfoModalOpen = open;
    },

    closeNetworkInfoModal() {
      this.networkInfoModalOpen = false;
    }
  },
}
</script>

<style scoped>
.logo {
  text-decoration: none;
}
</style>