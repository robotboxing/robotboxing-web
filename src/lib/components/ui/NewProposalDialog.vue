<template>
  <v-dialog
      persistent
      v-model="open"
      :width="minimumWidth"
    >
      <v-card>
        <v-card-title>
          New Proposal: {{ proposal.name }}
        </v-card-title>
        <v-card-text v-if="transactionHash">
          <v-alert
            border="right"
            colored-border
            type="success"
            elevation="2"
          >
            The proposal has been sent to the smart contract. 

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
            You are creating a new proposal! The data will be sent to the smart contract.
          </v-alert>
          
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    Property
                  </th>
                  <th class="text-left">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ERC-20 Voting Power</td>
                  <td>
                    <div 
                      class="d-inline-block text-truncate"
                      style="max-width: 250px;" 
                      :title="proposal.erc20VotingPower">
                      {{ proposal.erc20VotingPower }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Target Contract</td>
                  <td>
                    <div 
                      class="d-inline-block text-truncate"
                      style="max-width: 250px;"
                      :title="proposal.targetContract">
                      {{ proposal.targetContract }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>On-chain</td>
                  <td>
                    <div>
                      {{ parsedProposal.onChain ? 'Yes' : 'No' }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Block Limit</td>
                  <td>
                    <div>
                      {{ parsedProposal.blockLimit }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Minimum Quorum</td>
                  <td>{{ proposal.displayMinimumQuorum }}</td>
                </tr>
                <tr>
                  <td colspan="2">
                    Options:
                    <ul>
                      <li :key="option.value" v-for="option in proposal.options">
                        {{ option.text }}
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            :disabled="creating"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            v-if="!transactionHash"
            color="info"
            :loading="creating"
            text
            @click="addProposal"
          >
            Create Proposal
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
import IPFSHelper from '@/lib/helpers/IPFSHelper';
import VotilityProtocolProxy from '@/lib/eth/VotilityProtocolProxy';
import HexHelper from '@/lib/helpers/HexHelper';

import { Decimal } from 'decimal.js';

export default {
  props: ['open', 'proposal'],
  
  data() {
    return {
      transactionHash: '',
      creating: false,
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
    },

    parsedProposal() {
      return {
        data: HexHelper.getOnlyValues(this.proposal.data),
        erc20VotingPower: this.proposal.erc20VotingPower, 
        targetContract: this.proposal.targetContract, 
        blockLimit: parseInt(this.proposal.blockLimit, 10), 
        options: HexHelper.getOnlyValues(this.proposal.options), 
        onChain: true,
        snapshotId: this.proposal.snapshotId ? parseInt(this.proposal.snapshotId, 10) : 0,
        minimumQuorum: this.proposal.rawMinimumQuorum,
      };
    }
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async addProposal() {
      const ipfsData = await IPFSHelper.add(JSON.stringify(this.proposal));
      const vpProxy = new VotilityProtocolProxy();

      const newProposal = {...this.parsedProposal, ipfsData: ipfsData.path};
      console.log(JSON.stringify(newProposal));

      this.creating = true;
      
      try {
        this.transactionHash = await vpProxy.addProposal(newProposal, this.account);
      } finally {
        this.creating = false;
      }
    },
  }
}
</script>
