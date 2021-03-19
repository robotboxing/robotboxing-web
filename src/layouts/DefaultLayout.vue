<template>
  <v-layout class="fill-height">
    {{$route.name}}
    <app-header />
    <v-main>
      <v-container :fluid="false" class="pt-3">
        <router-view :key="$route.fullPath"></router-view>

        <v-dialog
          v-model="showModal"
          persistent
          max-width="300"
        >
          <v-card>
            <v-card-title class="headline">
              Connect to Metamask
            </v-card-title>
            <v-card-text>
              <v-container fill-height>
                <v-row class="justify-center align-center">
                  <v-col cols="12">
                    <v-img 
                      class="text-center"
                      src="/images/project/metamask.svg" />  
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="green darken-1"
                text
                @click="connectToMetaMask"
              >
                Connect
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
    <app-footer />
  </v-layout>
</template>

<script>
import AppHeader from '@/lib/components/ui/App/AppHeader';
import AppFooter from '@/lib/components/ui/App/AppFooter';

export default {
  components: {
    AppHeader,
    AppFooter,
  },

  data() {
    return {
      showModal: true,
    }
  },

  computed: {
    isConnected() {
      return this.$store.getters['user/isConnected'];
    },
  },

  watch: {
    isConnected() {
      this.showModal = !this.isConnected;
    }
  },

  methods: {
    connectToMetaMask() {
      if (!this.isConnected) {
        this.$store.dispatch('user/connectToMetaMask');
      }
    }
  }
}
</script>

<style lang="scss">
.app-bar-full {
  .v-toolbar__content,
  .v-toolbar__extension {
    padding: 0;
  }
}
</style>