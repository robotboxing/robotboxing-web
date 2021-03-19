<template>
  <div>
    <v-card color="grey lighten-4" flat>
      <v-toolbar class="elevation-0">
        <v-toolbar-title>Robots</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="success" class="mr-4" outlined to="/my-robots">
          My Robots
        </v-btn>

        <v-btn color="success" class="mr-4" @click="goToNewRobot()">
          Create your Robot
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
        <v-col
          v-for="(star, index) in countStar"
          :key="index"
          cols="12"
          md="4"
          lg="4"
        >
          <v-card class="pa-3 text-center">
            <div class="overline mb-2">
              <v-rating
                v-model="star.star"
                length="3"
                background-color="orange lighten-3"
                color="orange"
                large
              ></v-rating>
            </div>
            <div class="text-h4">{{ star.count }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container fluid v-if="!loading">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-select
            :items="itemsFilter"
            v-model="selectFilter"
            label="Star - Star - show all"
            solo
            @change="filterStar"
          ></v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="search"
            :counter="15"
            label="Search..."
            required
            solo
            autocomplete="off"
          >
            <template v-slot:append>
              <v-btn color="success" small outlined @click="searchName">
                search
                <v-icon class="ml-1" small>mdi-magnify</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-container fluid v-if="loading || filterLoading">
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
      <v-row dense v-if="myRobots.length">
        <v-col
          cols="12"
          md="3"
          :key="robot.response.name"
          v-for="robot in myRobots"
        >
          <v-card class="mx-auto" min-height="520">
            <v-card-title>{{ robot.response.name }}</v-card-title>

            <v-img height="354" :src="robot.response.image"></v-img>

            <v-card-text>
              {{ robot.response.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row dense v-else>
        <v-col cols="12" md="12">
          <div class="text-center">
            <h1 class="my-3">No robot was found</h1>
            <v-btn color="success" @click="goToNewRobot()">
              Create Robot
              <v-icon right>mdi-file-star-outline</v-icon>
            </v-btn>
          </div>
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
  </div>
</template>

<script>
import RobotBoxingProxy from "@/lib/eth/RobotBoxingProxy";
import RoboHashAddress from "@/lib/components/ui/RoboHashAddress.vue";
import TransactionLink from "@/lib/components/ui/TransactionLink.vue";

export default {
  components: {
    RoboHashAddress,
    TransactionLink,
  },

  data() {
    return {
      page: 1,
      pageCount: 0,
      pageSize: 8,
      myRobots: [],
      search: "",

      loading: true,
      filterLoading: false,

      itemsFilter: ["Star - show all", "1 Star", "2 Star", "3 Star"],
      selectFilter: "Star - show all",

      countStar: [
        {
          star: 1,
          count: 0,
        },
        {
          star: 2,
          count: 0,
        },
        {
          star: 3,
          count: 0,
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
  },

  watch: {
    isConnected() {
      this.loadData();
    },

    account() {
      this.loadData();
    },

    page() {
      this.loadData();
    },
  },

  mounted() {
    this.loadData();
  },

  methods: {
    goToNewRobot() {
      this.$router.push(`/robots/new`);
    },

    async loadData() {
      if (!this.isConnected) {
        return;
      }

      this.loading = true;

      try {
        await Promise.all([this.loadMyRobots(), this.totalRobotsStar()]);
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },

    async loadMyRobots(page) {
      if (!this.isConnected) {
        return;
      }

      const rbProxy = new RobotBoxingProxy();
      const count = await rbProxy.getRobotsCount();

      this.page = page || this.page;
      this.pageCount = Math.ceil(count / this.pageSize);

      const myRobots = await rbProxy.getRobots(this.pageSize, this.page - 1);

      this.myRobots = myRobots.filter((robot) => robot.status === 200);
    },

    async totalRobotsStar() {
      if (!this.isConnected) {
        return;
      }

      const rbProxy = new RobotBoxingProxy();
      const promises = [];

      for (let star of this.countStar) {
        promises.push(rbProxy.getRobotsByStarCount(star.star));
      }

      const promisesAll = await Promise.all(promises);

      for (let index in this.countStar) {
        this.countStar[index].count = promisesAll[index];
      }
    },

    async filterStar() {
      if (!this.isConnected) {
        return;
      }

      if (this.selectFilter === "Star - show all") {
        return this.loadData();
      }

      this.filterLoading = true;

      const rbProxy = new RobotBoxingProxy();
      const count = await rbProxy.getRobotsByStarCount(
        parseInt(this.selectFilter)
      );

      this.pageCount = Math.ceil(count / this.pageSize);

      const myRobots = await rbProxy.getRobotsFilterStar(
        this.pageSize,
        this.page - 1,
        parseInt(this.selectFilter)
      );

      this.myRobots = myRobots.filter((robot) => robot.status === 200);

      this.filterLoading = false;
    },

    async searchName() {
      if (!this.isConnected) {
        return;
      }

      if (this.search === "") {
        return this.loadData();
      }

      this.filterLoading = true;

      const rbProxy = new RobotBoxingProxy();
      const robotIndex = await rbProxy.getRobotByName(this.search);
      if (parseInt(robotIndex) === 0) {
        this.myRobots = [];
        this.filterLoading = false;
        return;
      }
      const robot = await rbProxy.getRobot(robotIndex);
      console.log(robot);

      this.myRobots = [robot].filter((robot) => robot.status === 200);

      this.filterLoading = false;
    },

    subscribeToEvents() {
      // if (!this.isConnected) {
      //   return;
      // }
      // const proxy = new RobotBoxingProxy();
      // const events = proxy.events();
      // events.NewRobot({fromBlock: 0})
      // .on('connected', function(subscriptionId){
      //    console.log({subscriptionId});
      // })
      // .on('data', (event) => {
      //   console.log('data', event);
      //   this.loadMyRobots();
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
