<template>
  <v-dialog
      persistent
      v-model="open"
      :width="minimumWidth"
    >
      <v-card>
        <v-card-title>
          Finish {{ content.name }}
        </v-card-title>

        <v-card-text v-if="transactionHash">
          <v-alert
            border="right"
            colored-border
            type="success"
            elevation="2"
          >
            The transactiton has been set to smart contract. 

            <p>{{ transactionHash }}</p>
          </v-alert>
        </v-card-text>

        <v-card-text v-if="!transactionHash">
          <v-alert
            border="right"
            colored-border
            type="warning"
            elevation="2"
          >
            <p>You are about to finish the proposal. A finished proposal can't receive votes and all the data will be
            sent to target smart contract (if available).</p>
            <p>You can't undo this operation!</p>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="close"
          >
            Close
          </v-btn>
          
          <v-btn
            v-if="!transactionHash"
            color="info"
            :loading="finishing"
            text
            @click="finish"
          >
            Finish
          </v-btn>
          <v-btn
            v-if="transactionHash"
            color="success"
            text
            @click="close"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import VotilityProtocolProxy from '@/lib/eth/VotilityProtocolProxy';

export default {
  props: ['open', 'proposal', 'content'],
  
  data() {
    return {
      finishing: false,
      transactionHash: '',
    }
  },

  computed: {
    minimumWidth() {
      return this.transactionHash ? 750 : 500;
    },

    isConnected() {
      return this.$store.getters['user/isConnected'];
    },

    account() {
      return this.$store.getters['user/account'];
    }
  },

  methods: {
    clear() {
      this.transactionHash = '';
    },

    close() {
      this.clear();
      this.$emit('close');
    },

    async finish() {
      this.finishing = true;
      const vpProxy = new VotilityProtocolProxy();

      try {
        this.transactionHash = await vpProxy.finish(this.proposal.id, this.account);
      } finally {
        this.finishing = false;
      }
    }
  }
}
</script>
