<template>
  <div>
    <v-container style="width: 800px;">
      <v-card color="grey lighten-4" flat>
        <v-toolbar class="elevation-0">
          <v-toolbar-title>New Robot</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="success" class="mr-4" outlined @click="$router.go(-1)">
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
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
                    label="Name robot*"
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
                  <v-textarea
                    v-model="entity.description"
                    label="Description robot"
                    :counter="150"
                    rows="2"
                    value=""
                    :disabled="robotName === '' || robotName !== entity.name"
                  ></v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-currency-field
                    v-model="entity.amount"
                    label="Pay amount*"
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
              <v-row align="center">
                <v-col class="grow">
                  Your robot has been successfully created
                </v-col>

                <v-col class="shrink">
                  <v-btn color="success" to="/my-robots">
                    See my robot
                  </v-btn>
                </v-col></v-row
              >
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
import RobotBoxingProxy from "@/lib/eth/RobotBoxingProxy";

export default {
  components: {
    Editor,
    NewProposalDialog,
    TokenDialog,
    RoboView,
  },

  data() {
    return {
      entity: {
        stars: 1,
        name: "",
      },
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

  computed: {
    isConnected() {
      return this.$store.getters["user/isConnected"];
    },

    account() {
      return this.$store.getters["user/account"];
    },
  },

  methods: {

    rulesMintRobot() {
      if (this.entity.name === "") {
        throw {
          status: 409,
          code: "INVALID_NAME",
        };
      }
      if (this.entity.amount <= 0 || this.minAmount > this.entity.amount) {
        throw {
          status: 409,
          code: "INVALID_MIN_AMOUNT",
        };
      }
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
          description: this.entity.description,
          image: `https://dynamic-robot.herokuapp.com/${
            this.entity.stars
          }/${this.entity.name.toLowerCase()}`,
          star: this.entity.stars,
        };

        const ipfsData = await IPFSHelper.add(JSON.stringify(infoRobot));
        const vpProxy = new RobotBoxingProxy();

        const newMint = {
          name: this.entity.name.toLowerCase(),
          star: this.entity.stars,
          amount: this.entity.amount,
          tokenURI: `https://ipfs.io/ipfs/${ipfsData.path}`,
        };

        this.creating = true;

        this.transactionHash = await vpProxy.mintRobot(newMint, this.account);
        this.successRobot = true;
        this.entity.name = '';
        this.entity.description = '';
        this.entity.amount = 0;
      } catch (error) {
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

    async updateImage() {
      this.robotName = this.entity.name;
      this.robotStars = this.entity.stars;
      const vpProxy = new RobotBoxingProxy();
      this.minAmount = await vpProxy.getMinBidByStar(this.entity.stars);
      this.minAmount += 0.0005;
      this.minAmount = this.minAmount.toFixed(4);
    },
  },
};
</script>
