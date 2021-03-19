import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export const routes = [
  ,
  {
    path: "/",
    component: () =>
      import(
        /* webpackChunkName: "layout-default" */ "@/layouts/DefaultLayout.vue"
      ),
    children: [
      {
        path: "/",
        name: "/",
        component: () =>
          import(/* webpackChunkName: "Robots" */ "@/pages/Robots.vue"),
      },
      {
        path: "/my-robots",
        name: "/my-robots",
        component: () =>
          import(/* webpackChunkName: "MyRobots" */ "@/pages/MyRobots.vue"),
      },
      {
        path: "/robots/new",
        name: "/new",
        component: () =>
          import(/* webpackChunkName: "NewRobot" */ "@/pages/NewRobot.vue"),
      },
    ],
  },
];

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL || "/",
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
  routes,
});

/**
 * Before each route update
 */
router.beforeEach((to, from, next) => {
  return next();
});

/**
 * After each route update
 */
router.afterEach((to, from) => {});

export default router;
