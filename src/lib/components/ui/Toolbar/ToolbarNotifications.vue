<template>
  <div>
    <v-menu offset-y left transition="slide-y-transition">
      <template v-slot:activator="{ on }">
        <v-badge
          bordered
          offset-x="14"
          offset-y="14"
          :content="count"
          :value="count"
        >
          <v-btn @click="count = 0" icon v-on="on" class="elevation-2">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </v-badge>
      </template>
      <v-card>
        <v-list three-line dense max-width="400">
          <v-subheader class="pa-2 font-weight-bold">Notifications</v-subheader>
          <div v-for="(item, index) in items" :key="index">
            <v-divider v-if="index > 0 && index < items.length" inset></v-divider>

            <v-list-item @click="goToProposal(item.proposalId)">
              <v-list-item-avatar size="32" :color="item.color">
                <v-icon dark small>{{ item.icon }}</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
                <v-list-item-subtitle class="caption" v-text="item.subtitle"></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="align-self-center">
                <v-list-item-action-text v-text="item.time"></v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
          </div>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import RobotBoxingProxy from '@/lib/eth/RobotBoxingProxy';

export default {
  data() {
    return {
      items: [],
      count: 0
    }
  },

  computed: {
    isConnected() {
      return this.$store.getters['user/isConnected'];
    },

    account() {
      return this.$store.getters['user/account'];
    }
  },

  watch: {
    isConnected() {
      this.subscribeToEvents();
    },
  },

  mounted() {
    this.subscribeToEvents();
  },

  methods: {
    goToProposal(proposalId) {
      this.$router.push(`/proposals/${proposalId}`);
    },

    parseNewProposalEvent(event) {
      this.items.unshift({
        proposalId: event.returnValues.proposalId,
        title: `New Proposal #${event.returnValues.proposalId}`,
        color: 'success',
        icon: 'mdi-file-star-outline',
        subtitle: `A new proposal was sent by ${event.returnValues.owner}`,
        time: `Block #${event.blockNumber}`
      });
    },

    parseProposalFinishedEvent(event) {
      this.items.unshift({
        proposalId: event.returnValues.proposalId,
        title: `Proposal finished #${event.returnValues.proposalId}`,
        color: 'info',
        icon: 'mdi-file-star-outline',
        subtitle: `A proposal has been finished by ${event.returnValues.finisher}`,
        time: `Block #${event.blockNumber}`
      });
    },

    parseNewVoteEvent(event) {
      this.items.unshift({
        proposalId: event.returnValues.proposalId,
        title: `Note Vote`,
        color: 'teal lighten-1',
          icon: 'mdi-vote',
        subtitle: `The proposal #1 received a vote by ${event.returnValues.voter}`,
        time: `Block #${event.blockNumber}`
      });
    },

    parseNewEvent(event) {
      if (event.event === 'NewProposal') this.parseNewProposalEvent(event);
      if (event.event === 'NewVote') this.parseNewVoteEvent(event);
      if (event.event === 'ProposalFinished') this.parseProposalFinishedEvent(event);

      if (this.items.length > 5) {
        this.items.pop();
      }

      this.count++;
    },

    subscribeToEvents() {
      if (!this.isConnected) {
        return;
      }

      // const proxy = new RobotBoxingProxy();
      // const events = proxy.events();

      // events.allEvents({fromBlock: 0})
      // .on('data', (event) => {
      //   this.parseNewEvent(event);
      // })
    }
  }
}
</script>
