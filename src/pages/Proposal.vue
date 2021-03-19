<template>
  <div>
    <v-card
      color="grey lighten-4"
      flat
    >
      <v-toolbar class="elevation-0">
        <v-toolbar-title>
          <v-skeleton-loader
            v-if="loading"
            type="text"
          ></v-skeleton-loader>
          <span v-else>
            Proposal: {{ content.name }} #{{ proposal.id }}
          </span>
           <v-spacer></v-spacer>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <mark-button class="ma-2" :proposalId="proposal.id" />
        <v-btn color="success" @click="vote">
          <v-icon left>mdi-vote</v-icon>
          Vote
        </v-btn>

        <v-menu
          bottom
          offset-y
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn 
              class="ma-2"
              v-bind="attrs"
              v-on="on"
              icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="finish">
              <v-list-item-icon>
                <v-icon>mdi-cards</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Finish
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="loadProposal">
              <v-list-item-icon>
                <v-icon>mdi-reload</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Reload
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="goToHistory"  v-if="tab !== 1">
              <v-list-item-icon>
                <v-icon>mdi-history</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Show History
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="goToContent" v-if="tab !== 0">
              <v-list-item-icon>
                <v-icon>mdi-file-document-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                Show Content
              </v-list-item-content>
            </v-list-item>
            
          </v-list>
        </v-menu>
      </v-toolbar>
    </v-card>
    
    <v-divider class="my-2"></v-divider>
    <v-container>
      <v-row>
        <v-col>
          <proposal-dashboard-item :loading="loading" title="Quorum" :value="votingWeight" />
        </v-col>
        <v-col>
          <proposal-dashboard-item :loading="loading" title="Block Limit">
            #{{ proposal.blockLimit }}
            <small>Current: #{{currentBlockNumber}}</small>
          </proposal-dashboard-item>
        </v-col>
        <v-col>
          <proposal-dashboard-item :loading="loading" title="Status">
            <v-chip x-small v-if="proposal.isFinished" color="error" class="font-weight-bold">Finished</v-chip>
            <v-chip x-small v-if="!proposal.isFinished && proposal.blockLimit < currentBlockNumber" color="error" class="font-weight-bold">Expired</v-chip>
            <v-chip x-small v-if="!proposal.isFinished && proposal.blockLimit >= currentBlockNumber" color="success" class="font-weight-bold">Active</v-chip>
          </proposal-dashboard-item>
        </v-col>
        <v-col>
          <proposal-dashboard-item :loading="loading" title="ERC-20 Voting Power">
            {{tokenInfo.symbol}}
            <v-btn icon x-small @click="showTokenDialog">
              <v-icon>mdi-share-all</v-icon>
            </v-btn>
          </proposal-dashboard-item>
        </v-col>
      </v-row>
      <v-row v-if="showContent">
        <v-col cols="6">
          <v-skeleton-loader
            v-if="loading"
            type="paragraph"
            ></v-skeleton-loader>
          <span v-else v-html="content.page"></span>
        </v-col>
        <v-col cols="6">
          <v-skeleton-loader
            v-if="loading"
            type="image"
            ></v-skeleton-loader>
          <apexchart v-else type="pie" :options="options" :series="series"></apexchart>
        </v-col>
      </v-row>
      <v-row v-if="showHistory">
        <v-col cols="12">
          <v-skeleton-loader
            v-if="loading"
            type="table"
          ></v-skeleton-loader>
          <v-data-table
            v-else
            :headers="headers"
            :items="votes"
            class="elevation-1"
          >
            <template v-slot:item.voter="{ item }">
              <robo-hash-address :address="item.voter" />                  
            </template>
            <template v-slot:item.weight="{ item }">
              <token-amount :amount="item.weight" :symbol="tokenInfo.symbol" :decimals="tokenInfo.decimals" />                  
            </template>
            <template v-slot:item.option="{ item }">
              {{ item.option.text }}             
              <small>
                {{ item.optionValue }}
              </small>
            </template>
            <template v-slot:item.transactionHash="{ item }">
              <transaction-link :transactionHash="item.transactionHash" />          
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <token-dialog v-if="tokenDialog" :open="tokenDialog" :info="tokenInfo" @close="closeTokenDialog" />
    <vote-dialog :open="voteDialogOpen" :proposal="this.proposal" :content="this.content" @close="voteDialogOpen = false" />
    <finish-proposal-dialog :open="finishProposalDialogOpen" :proposal="this.proposal" :content="this.content" @close="finishProposalDialogOpen = false" />
  </div>
</template>

<script>
import IPFSHelper from '@/lib/helpers/IPFSHelper';
import TokenDialog from '@/lib/components/ui/TokenDialog';
import VoteDialog from '@/lib/components/ui/Proposal/VoteDialog';
import FinishProposalDialog from '@/lib/components/ui/Proposal/FinishProposalDialog';
import VotilityProtocolProxy from '@/lib/eth/VotilityProtocolProxy';
import ERC20Proxy from '@/lib/eth/ERC20Proxy';
import { Decimal } from 'decimal.js';
import RoboHashAddress from '@/lib/components/ui/RoboHashAddress.vue';
import TokenAmount from '@/lib/components/ui/TokenAmount.vue';
import TransactionLink from '@/lib/components/ui/TransactionLink.vue';
import ProposalDashboardItem from '@/lib/components/ui/Proposal/ProposalDashboardItem';

import MarkButton from '@/lib/components/ui/MarkButton';

export default {
  components: {
    VoteDialog,
    RoboHashAddress,
    TokenAmount,
    TransactionLink,
    MarkButton,
    FinishProposalDialog,
    TokenDialog,
    ProposalDashboardItem,
  },
  
  data() {
    return {
      tokenDialog: false,

      voteDialogOpen: false,
      finishProposalDialogOpen: this.$route.params.tab === 'finish',

      loading: true,

      votingWeight: 0,
      currentBlockNumber: 0,

      proposal: {},
      content: {
        options: []
      },
      proposalId: this.$route.params.id,
      votes: [],

      tokenInfo: {
      },

      headers: [
        { text: 'Voter', value: 'voter', width: '80px' },
        { text: 'Weight', value: 'weight', width: '150px' },
        { text: 'Option', value: 'option' },
        { text: 'Transaction Hash', value: 'transactionHash' },
      ],

      series: [],

      tab: this.$route.params.tab === 'history' ? 1 : 0,
    }
  },

  computed: {
    showHistory() {
      return this.tab === 1;
    },

    showContent() {
      return this.tab === 0;
    },

    options() {
      return {
        labels: this.content.options.map(option => option.text)
      }
    },

    isConnected() {
      return this.$store.getters['user/isConnected'];
    },

    account() {
      return this.$store.getters['user/account'];
    },
  },

  watch: {
    isConnected() {
      this.loadProposal();
    }
  },

  mounted() {
    this.loadProposal();
  },

  methods: {
    goToHistory() {
      this.$router.push(`/proposals/${this.proposalId}/history`);
    },

    goToContent() {
      this.$router.push(`/proposals/${this.proposalId}`);
    },

    closeTokenDialog() {
      this.tokenDialog = false;
    },

    showTokenDialog() {
      this.tokenDialog = true;
    },

    async loadProposal() {
      if (this.isConnected) {
        const proxy = new VotilityProtocolProxy();
        this.loading = true;

        try {

          this.currentBlockNumber = await web3.eth.getBlockNumber();
          
          this.proposal = await proxy.getProposal(this.proposalId);
          this.content = JSON.parse(await IPFSHelper.read(this.proposal.ipfsData));

          const tokenProxy = new ERC20Proxy(this.proposal.erc20VotingPower);
          this.tokenInfo = await tokenProxy.getInfo(this.account);

          const series = [];

          for(let i = 0; i < this.content.options.length; i++) {
            series.push(await proxy.getVotesWeight(this.proposal.id, i))
          }

          const votingWeight = series.reduce((acc, curr) => acc.plus(curr), new Decimal(0));
          const proportion = votingWeight.dividedBy(this.proposal.minimumQuorum) * 100;
          this.votingWeight = `${proportion.toFixed(2)}%`;

          this.series = series.map(serie => new Decimal(serie).dividedBy(this.proposal.minimumQuorum).toNumber());

          const [event] = await proxy.getNewProposalEvents(this.proposal.id);
          const votes = await proxy.getNewVoteEvents(event.blockNumber, this.proposal.id);

          this.votes = votes.map(vote => {
            return {
              ...vote,
              option: this.content.options[vote.optionIndex],
            }
          })
        } finally {
          this.loading = false;
        }
      }
    },

    vote() {
      if (this.isConnected) {
        this.voteDialogOpen = true;
      }
    },

    finish() {
      if (this.isConnected) {
        this.finishProposalDialogOpen = true;
      }
    },
  }
}
</script>