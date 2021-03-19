<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>My Robots</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="success" class="mr-4" @click="goToNewRobot()">
          New Robot
          <v-icon right>mdi-file-star-outline</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card>

    <v-divider class="my-2"></v-divider>
    <v-container fluid v-if="loading">
      <v-row dense>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else>
      <v-row dense>
        <v-col v-for="(stat, i) in stats" :key="i" cols="12" md="4" lg="4">
          <v-card class="pa-3 text-center">
            <div class="overline mb-2">
              <v-rating
                v-model="stat.star"
                length="3"
                background-color="orange lighten-3"
                color="orange"
                large
              ></v-rating>
            </div>
            <div class="text-h4">{{ stat.value }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container fluid v-if="loading">
      <v-row dense>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
        <v-col>
          <v-skeleton-loader
            type="card-heading, image, list-item, list-item, actions"
          ></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else>
      <v-row dense>
        <v-col
          cols="12"
          md="3"
          :key="proposal.id"
          v-for="proposal in proposals"
        >
          <v-card>
            <v-app-bar flat>
              <v-toolbar-title>
                {{ proposal.content.name }}
              </v-toolbar-title>
              <v-chip
                v-if="proposal.isFinished"
                x-small
                color="error"
                class="font-weight-bold ml-1"
                >Finished</v-chip
              >
              <v-spacer></v-spacer>
              <mark-button :proposalId="proposal.id" />
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="goToFinish(proposal.id)">
                    <v-list-item-icon>
                      <v-icon>mdi-cards</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      Finish
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="goToHistory(proposal.id)">
                    <v-list-item-icon>
                      <v-icon>mdi-history</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      Show History
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="goToProposal(proposal.id)">
                    <v-list-item-icon>
                      <v-icon>mdi-share-all</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      View
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-app-bar>
            <div class="pa-3">
              <div class="d-flex align-center flex-column">
                <v-avatar small size="120">
                  <robo-hash-address
                    size="120"
                    :address="proposal.votingOwner"
                  />
                </v-avatar>
                <div class="text-center mt-2">
                  <div class="secondary--text text--lighten-1 text-caption">
                    {{ proposal.tokenInfo.symbol }}
                  </div>
                  <div class="secondary--text text--lighten-1 text-caption">
                    Block Limit: {{ proposal.blockLimit }}
                  </div>
                  <v-chip
                    v-if="proposal.blockLimit < currentBlockNumber"
                    x-small
                    color="error"
                    class="font-weight-bold ml-1"
                    >Expired</v-chip
                  >
                  <v-chip
                    v-if="proposal.blockLimit >= currentBlockNumber"
                    x-small
                    color="success"
                    class="font-weight-bold ml-1"
                    >Active</v-chip
                  >
                </div>
                <div class="text-center mt-2">
                  <div class="secondary--text text--lighten-1 text-caption">
                    Minimum Quorum:
                    <minimum-quorum :minimumQuorum="proposal.minimumQuorum" />
                  </div>
                </div>
              </div>
              <quorum-progress-bar
                :minimumQuorum="proposal.minimumQuorum"
                :totalSupply="proposal.tokenInfo.totalSupply"
                :weight="proposal.weight"
              />
            </div>
            <v-divider></v-divider>
            <div class="d-flex">
              <v-btn
                @click="goToProposal(proposal.id)"
                class="flex-grow-1"
                tile
                height="48"
                text
              >
                <v-icon left>mdi-share-all</v-icon>
                View
              </v-btn>
              <v-divider vertical></v-divider>
              <v-btn
                :disabled="
                  proposal.isFinished ||
                    proposal.blockLimit < currentBlockNumber
                "
                @click="openVoteDialog(proposal)"
                class="flex-grow-1"
                tile
                height="48"
                text
              >
                <v-icon left>mdi-vote</v-icon>
                Vote
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center" v-if="pageCount > 1">
      <v-container>
        <v-row justify="center">
          <v-col cols="8">
            <v-container class="max-width">
              <v-pagination
                v-model="page"
                class="my-4"
                :length="pageCount"
              ></v-pagination>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <vote-dialog
      :open="voteDialog"
      :proposal="this.selectedProposal"
      :content="this.selectedContent"
      @close="closeVoteDialog"
    />
  </div>
</template>

<script>
import IPFSHelper from "@/lib/helpers/IPFSHelper";
import VoteDialog from "@/lib/components/ui/Proposal/VoteDialog";
import VotilityProtocolProxy from "@/lib/eth/VotilityProtocolProxy";
import SirRobotItemProxy from "@/lib/eth/SirRobotItemProxy";
import ERC20Proxy from "@/lib/eth/ERC20Proxy";
import RoboHashAddress from "@/lib/components/ui/RoboHashAddress.vue";
import TokenAmount from "@/lib/components/ui/TokenAmount.vue";
import TransactionLink from "@/lib/components/ui/TransactionLink.vue";
import MinimumQuorum from "@/lib/components/ui/Proposal/MinimumQuorum.vue";
import QuorumProgressBar from "@/lib/components/ui/Proposal/QuorumProgressBar.vue";

import MarkButton from "@/lib/components/ui/MarkButton";

export default {
  components: {
    VoteDialog,
    RoboHashAddress,
    TokenAmount,
    TransactionLink,
    MinimumQuorum,
    QuorumProgressBar,
    MarkButton,
  },

  data() {
    return {
      page: 1,
      pageCount: 0,
      pageSize: 8,
      proposals: [],
      voteDialog: false,
      selectedProposal: {},
      selectedContent: {},

      currentBlockNumber: 0,

      loading: true,

      stats: [
        {
          star: 1,
          color: "success",
          title: "Proposals",
          value: "0",
        },
        {
          star: 2,
          color: "grey",
          title: "Finished",
          value: "0",
        },
        {
          star: 3,
          color: "yellow",
          title: "Burnt Tokens",
          value: "0",
        },
      ],
    };
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    markedProposals() {
      return this.$store.getters["user/markedProposals"];
    },
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    page() {
      this.loadProposals();
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    goToProposal(proposalId) {
      this.$router.push(`/robots/${proposalId}`);
    },

    goToHistory(proposalId) {
      this.$router.push(`/robots/${proposalId}/history`);
    },

    goToFinish(proposalId) {
      this.$router.push(`/robots/${proposalId}/finish`);
    },

    goToNewRobot() {
      this.$router.push(`/robots/new`);
    },

    closeVoteDialog() {
      this.selectedProposal = {};
      this.selectedContent = {};
      this.voteDialog = false;
    },

    openVoteDialog(proposal) {
      this.selectedProposal = proposal;
      this.selectedContent = proposal.content;
      this.voteDialog = true;
    },

    async loadData() {
      if (!this.isConnected) {
        return;
      }

      this.loading = true;

      const vpProxy = new SirRobotItemProxy();

      var count = await vpProxy.countRobots(this.account);
      console.log(`count ${count}`);

      var token0 = await vpProxy.tokenOfOwnerByIndex(this.account, 0);
      console.log(`token0 ${token0}`);

      var star1 = await vpProxy.getRobotUriByStarAndIndex(1, token0);
      console.log(`star1 ${star1}`);

      var star2 = await vpProxy.tokenURI(token0);
      console.log(`star2 ${star2}`);

      // var star3 = await vpProxy.getRobotUriByStarAndIndex(3, token0);
      // console.log(`star3 ${star3}`);
      
      try {
        await Promise.all([
          this.loadCurrentBlockNumber(),
          this.loadInfo(),
          this.loadProposals(),
          this.subscribeToEvents(),
        ]);
      } catch (e) {
      } finally {
        this.loading = false;
      }
    },

    async loadCurrentBlockNumber() {
      if (!this.isConnected) {
        return;
      }

      this.currentBlockNumber = await web3.eth.getBlockNumber();
    },

    async loadInfo() {
      if (!this.isConnected) {
        return;
      }

      const proxy = new VotilityProtocolProxy();

      const info = await proxy.getInfo();

      this.stats[0].value = info.count;
      this.stats[1].value = info.finished;
      this.stats[2].value = info.burntTokens;
    },

    async loadProposals(page) {
      if (!this.isConnected) {
        return;
      }

      const proxy = new VotilityProtocolProxy();
      const count = await proxy.getProposalsCount();

      this.page = page || this.page;
      this.pageCount = Math.ceil(count / this.pageSize);

      const proposals = await proxy.getProposals(this.pageSize, this.page - 1);

      try {
        this.proposals = await Promise.all(
          proposals.map(async (proposal) => {
            const erc20Proxy = new ERC20Proxy(proposal.erc20VotingPower);

            return {
              ...proposal,
              weight: await proxy.getProposalWeight(proposal.id),
              tokenInfo: await erc20Proxy.getInfo(this.acount),
              content: proposal.ipfsData
                ? JSON.parse(await IPFSHelper.read(proposal.ipfsData))
                : {
                    name: "N/A",
                  },
            };
          })
        );
      } catch (e) {
        alert(e);
      }
    },

    subscribeToEvents() {
      // if (!this.isConnected) {
      //   return;
      // }
      // const proxy = new VotilityProtocolProxy();
      // const events = proxy.events();
      // events.NewProposal({fromBlock: 0})
      // .on('connected', function(subscriptionId){
      //    console.log({subscriptionId});
      // })
      // .on('data', (event) => {
      //   console.log('data', event);
      //   this.loadProposals();
      // })
      // .on('changed', function(event){
      //   console.log('changed', event);
      // })
      // .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
      //   console.log({error, receipt});
      // });
    },
  },
};
</script>
