<template>
  <div>
    <v-container style="width: 800px;">
      <v-card color="grey lighten-4" flat>
        <v-toolbar class="elevation-0">
          <v-toolbar-title>New Robot</v-toolbar-title>
        </v-toolbar>
      </v-card>
      <v-divider class="my-2"></v-divider>
      <v-container>
        <v-row dense>
          <v-col cols="12">
            <v-card class="pa-3">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="entity.name"
                    :counter="15"
                    label="Name robot"
                    required
                    autocomplete="off"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="mt-n6">
                  <p class="ma-0">
                    Choose the number of stars:
                  </p>
                  <div class="ml-3">
                    <div>
                      <b>1 Star</b> - The name must be between 10 characters and
                      15 characters
                    </div>
                    <div>
                      <b>2 Star</b> - The name must be between 5 characters and
                      15 characters
                    </div>
                    <div>
                      <b>3 Star</b> - The name must be between 1 characters and
                      15 characters
                    </div>
                  </div>
                  <v-rating
                    v-model="entity.stars"
                    length="3"
                    background-color="orange lighten-3"
                    color="orange"
                    large
                  ></v-rating>
                </v-col>
                <v-col
                  cols="12"
                  v-if="robotName !== '' && robotName === entity.name"
                >
                  <robo-view :name="robotName" :stars="robotStars"></robo-view>
                </v-col>
                <v-col cols="12" class="text-center">
                  <v-btn
                    :disabled="entity.name === ''"
                    color="primary"
                    @click="updateImage"
                  >
                    Generate Robot
                  </v-btn>
                </v-col>
                <v-col cols="12">
                  <v-currency-field
                    v-model="entity.amount"
                    label="Pay amount"
                    required
                    v-bind="currencyConfig"
                    :disabled="robotName === '' || robotName !== entity.name"
                  >
                  </v-currency-field>
                  <div v-if="robotName !== ''" class="ma-0 mt-n2 orange--text">
                    Minimum suggested amount: {{ minAmount }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12">
            <v-alert v-if="errorMsg" outlined type="error" prominent>
              {{ errorMsg }}
            </v-alert>
            <v-alert v-if="successRobot" outlined type="success" prominent>
              Your robot has been successfully created
            </v-alert>
          </v-col>
        </v-row>

        <v-row dense>
          <v-col cols="12" class="text-right">
            <v-btn
              color="success"
              class="mr-4"
              :disabled="robotName === ''"
              @click="mintRobot"
            >
              Mint your Robot
              <v-icon right>mdi-file-star-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </div>
</template>

<script>
import config from "@/configs";

import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";

import { Editor } from "@toast-ui/vue-editor";

import NewProposalDialog from "@/lib/components/ui/NewProposalDialog";
import TokenDialog from "@/lib/components/ui/TokenDialog";
import ERC20Proxy from "@/lib/eth/ERC20Proxy";
import HexHelper from "@/lib/helpers/HexHelper";

import RoboView from "@/lib/components/ui/RoboView";

import { Decimal } from "decimal.js";

import IPFSHelper from "@/lib/helpers/IPFSHelper";
import SirRobotItemProxy from "@/lib/eth/SirRobotItemProxy";

export default {
  components: {
    Editor,
    NewProposalDialog,
    TokenDialog,
    RoboView,
  },

  data() {
    return {
      tab: 0,
      enableCreateProposal: false,
      newProposalDialog: false,

      currentBlockNumber: 0,

      tokenDialog: false,
      tokenInfo: {},

      entity: {
        stars: 1,
        name: "",
      },
      config,
      drawer: null,
      isContentBoxed: false,

      tokenInfo: {},

      inputTypes: ["uint256", "address", "bool", "bytes32", "string"],

      headers: [
        { text: "Type", value: "type", sortable: false, width: "200px" },
        { text: "Value", value: "value", sortable: false },
        { text: "Text", value: "text", sortable: false, width: "300px" },
        { text: "Actions", value: "actions", sortable: false, width: "50px" },
      ],

      inputHeaders: [
        { text: "Type", value: "type", sortable: false, width: "200px" },
        { text: "Value", value: "value", sortable: false },
        { text: "Actions", value: "actions", sortable: false, width: "50px" },
      ],

      robotName: "",
      robotStars: 3,
      errorMsg: undefined,
      minAmount: 0,
      currencyConfig: {
        prefix: "ETH",
        suffix: "",
        decimalLength: 4,
        autoDecimalMode: true,
        allowNegative: false,
      },
      successRobot: false,
    };
  },

  watch: {
    tab() {
      if (this.tab === 3) {
        this.enableCreateProposal = true;
      }
    },

    "entity.erc20VotingPower"() {
      this.updateTokenInfo();
    },

    isConnected() {
      this.loadData();
    },
  },

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },

    parsedData() {
      return HexHelper.getOnlyValues(this.entity.data).join("\n");
    },

    parsedOptions() {
      return HexHelper.getOnlyValues(this.entity.options).join("\n");
    },

    actualMinimumQuorum() {
      Decimal.set({ toExpPos: 40 });

      if (this.tokenInfo.found && !isNaN(this.entity.minimumQuorum)) {
        try {
          const number = Decimal(this.entity.minimumQuorum);
          const actualMinimumQuorum = number.mul(
            new Decimal(10).pow(this.tokenInfo.decimals)
          );
          const proportion = actualMinimumQuorum
            .dividedBy(this.tokenInfo.totalSupply)
            .mul(100)
            .toFixed(2);

          this.entity.rawMinimumQuorum = actualMinimumQuorum.toString();
          this.entity.displayMinimumQuorum = `${this.entity.minimumQuorum} ${this.tokenInfo.symbol}`;
          return `Raw value: ${this.entity.rawMinimumQuorum} (${proportion}%)`;
        } catch (e) {
          console.log(e);
          return "";
        }
      }

      return "";
    },

    blockLimitHint() {
      return `Current block number is #${this.currentBlockNumber}`;
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    async loadCurrentBlockNumber() {
      if (!this.isConnected) {
        return;
      }

      this.currentBlockNumber = await web3.eth.getBlockNumber();
    },

    loadData() {
      this.loadCurrentBlockNumber();
    },

    async updateTokenInfo() {
      const proxy = new ERC20Proxy(this.entity.erc20VotingPower);
      this.tokenInfo = await proxy.getInfo(this.account);
    },

    addOption() {
      this.entity.options.push({});
    },

    addInput() {
      this.entity.data.push({});
    },

    async addProposal() {
      this.newProposalDialog = true;
    },

    rulesMintRobot() {
      if (this.entity.name === "") {
        throw {
          status: 409,
          code: "INVALID_NAME",
        };
      }
      console.log(this.entity.amount);
      console.log(this.minAmount);
      if (this.entity.amount <= 0 || this.minAmount > this.entity.amount) {
        throw {
          status: 409,
          code: "INVALID_MIN_AMOUNT",
        };
      }
      console.log("teste");
      if (
        this.entity.stars === 1 &&
        (this.entity.name.length < 10 || this.entity.name.length > 15)
      ) {
        throw {
          status: 409,
          code: "INVALID_NAME_LENGTH",
        };
      }
      if (
        this.entity.stars === 2 &&
        (this.entity.name.length < 5 || this.entity.name.length > 15)
      ) {
        throw {
          status: 409,
          code: "INVALID_NAME_LENGTH",
        };
      }
      if (this.entity.stars === 3 && this.entity.name.length > 15) {
        throw {
          status: 409,
          code: "INVALID_NAME_LENGTH",
        };
      }
    },

    async mintRobot() {
      try {
        this.errorMsg = "";
        this.rulesMintRobot();

        const infoRobot = {
          name: this.entity.name.toLowerCase(),
          description: `Robot generated for ${this.entity.name.toLowerCase()}. Ass: Sir Robot`,
          image: `https://dynamic-robot.herokuapp.com/${
            this.entity.stars
          }/${this.entity.name.toLowerCase()}`,
          star: this.entity.stars,
        };

        console.log(JSON.stringify(infoRobot));

        const ipfsData = await IPFSHelper.add(JSON.stringify(infoRobot));
        console.log(ipfsData);
        const vpProxy = new SirRobotItemProxy();

        const newMint = {
          name: this.entity.name.toLowerCase(),
          star: this.entity.stars,
          amount: this.entity.amount,
          tokenURI: `https://ipfs.io/ipfs/${ipfsData.path}`,
        };

        console.log(JSON.stringify(newMint));

        this.creating = true;

        this.transactionHash = await vpProxy.mintRobot(newMint, this.account);
        this.successRobot = true;
      } catch (error) {
        console.log(error);
        switch (error.code) {
          case "INVALID_MIN_AMOUNT":
            this.errorMsg =
              "Pay amount must be greater than or equal to the suggested amount";
            break;
          case "NAME_REGISTERED":
            this.errorMsg = "The name is already in use";
            break;
          case "INVALID_NAME":
            this.errorMsg = "The name invalid";
            break;
          case "INVALID_NAME_LENGTH":
            this.errorMsg = "Number of characters not allowed";
            break;
          case 4001:
            this.errorMsg =
              "MetaMask Tx Signature: User denied transaction signature.";
            break;
          default:
            this.errorMsg = "Unexpected error";
        }
      } finally {
        this.creating = false;
      }
    },

    updateValue() {
      this.entity.page = this.$refs.toastuiEditor.invoke("getHtml");
    },

    showHexValue(item) {
      return HexHelper.get32BytesHexValue(item.type, item.value);
    },

    async showTokenDialog(contractAddress) {
      try {
        const proxy = new ERC20Proxy(contractAddress);
        this.tokenInfo = await proxy.getInfo(this.account);
        this.tokenDialog = true;
      } catch (e) {
        this.tokenInfo = {
          contractAddress,
          found: false,
          symbol: "N/A",
          name: "N/A",
          totalSupply: "N/A",
          balanceOf: "N/A",
        };
        this.tokenDialog = true;
      }
    },

    copyCurrentBlock() {
      this.entity.blockLimit = parseInt(this.currentBlockNumber);
    },

    closeTokenDialog() {
      this.tokenDialog = false;
    },

    deleteOption(item) {
      this.entity.options = this.entity.options.filter((o) => o !== item);
    },

    deleteInputData(item) {
      this.entity.data = this.entity.data.filter((o) => o !== item);
    },

    async updateImage() {
      this.robotName = this.entity.name;
      this.robotStars = this.entity.stars;
      const vpProxy = new SirRobotItemProxy();
      this.minAmount = await vpProxy.getMinBidByStar(this.entity.stars);
      console.log(this.minAmount);
      this.minAmount += 0.0005;
      console.log(this.minAmount);
      this.minAmount = this.minAmount.toFixed(4);
      console.log(this.minAmount);
    },
  },
};
</script>
