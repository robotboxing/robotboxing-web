<template>
  <v-dialog
      persistent
      v-model="open"
      width="600"
    >
      <v-card>
        <v-card-title>
          {{ info.name }} - {{ info.symbol }}
        </v-card-title>
        <v-card-subtitle>
          {{ info.contractAddress }}
        </v-card-subtitle>
        <v-card-text v-if="!info.found">
           <v-alert
            border="right"
            colored-border
            type="error"
            elevation="2"
          >
            Can't get information about the token. Verify if it is a valid ERC20 contract address. 
          </v-alert>
        </v-card-text>
        <v-card-text v-if="!error">
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
                  <td>Name</td>
                  <td>
                    <div 
                      class="d-inline-block text-truncate"
                      style="max-width: 250px;" 
                      :title="info.name">
                      {{ info.name }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Total Supply</td>
                  <td>
                    <div 
                      class="d-inline-block text-truncate"
                      style="max-width: 250px;" 
                      :title="info.totalSupply">
                      {{ computedTotalSupply }} {{ info.symbol }} <br />
                      <small>
                        {{ info.totalSupply }}
                      </small>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Decimals</td>
                  <td>
                    <div 
                      class="d-inline-block text-truncate"
                      style="max-width: 250px;" 
                      :title="info.decimals">
                      {{ info.decimals }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Your Balance</td>
                  <td>
                    <div 
                      class="d-inline-block text-truncate"
                      style="max-width: 250px;" 
                      :title="info.balanceOf">
                      {{ computedBalanceOf }} {{ info.symbol }} <br />
                      <small>
                        {{ info.balanceOf }}
                      </small>
                    </div>
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
            @click="close"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import { Decimal } from 'decimal.js';

export default {
  props: ['open', 'info'],
  
  data() {
    return {
      error: false,
      contract: {
      }
    }
  },

  computed: {
    computedTotalSupply() {
      const d = new Decimal(this.info.totalSupply);
      return d.dividedBy(Math.pow(10, parseInt(this.info.decimals, 10))).toNumber();
    },

    computedBalanceOf() {
      const d = new Decimal(this.info.balanceOf);
      return d.dividedBy(Math.pow(10, parseInt(this.info.decimals, 10))).toNumber();
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },
  }
}
</script>
