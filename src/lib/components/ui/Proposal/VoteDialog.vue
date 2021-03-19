<template>
  <v-dialog
      persistent
      v-model="open"
      :width="minimumWidth"
    >
      <v-card>
        <v-card-title>
          Vote for {{ content.name }}
        </v-card-title>

        <v-card-text v-if="transactionHash">
          <v-alert
            border="right"
            colored-border
            type="success"
            elevation="2"
          >
            The vote been sent to the smart contract. 

            <p>{{ transactionHash }}</p>
          </v-alert>
        </v-card-text>

        <v-card-text v-if="!transactionHash">
          <v-radio-group v-model="option">
            <v-radio
              v-for="opt in content.options"
              :key="opt.value"
              :label="`${opt.text}`"
              :value="HexHelper.get32BytesHexValue(opt.type, opt.value)"
            ></v-radio>
          </v-radio-group>
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
            :loading="voting"
            text
            :disabled="!option"
            @click="vote"
          >
            Vote
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
import HexHelper from '@/lib/helpers/HexHelper';

export default {
  props: ['open', 'proposal', 'content'],
  
  data() {
    return {
      option: null,
      voting: false,
      transactionHash: '',
      HexHelper,
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
      this.option = null;
    },

    close() {
      this.clear();
      this.$emit('close');
    },

    async vote() {
      this.voting = true;
      const vpProxy = new VotilityProtocolProxy();

      const vote = {
        proposalId: this.proposal.id,
        option: this.option,
      };

      try {
        this.transactionHash = await vpProxy.vote(vote, this.account);
      } finally {
        this.voting = false;
      }
    }
  }
}
</script>
