import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import BooksView from '../views/BooksView.vue'
import RentalsView from '../views/RentalsView.vue'
import UsersView from '../views/UsersView.vue'
import PublishersView from '../views/PublishersView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/usersview',
    name: 'usersview',
    component: UsersView
  },
  {
    path: '/booksview',
    name:'booksview',
    component: BooksView
  },
   {
    path:'/rentalsview',
    name:'rentalsview',
    component: RentalsView
   },
   {
    path:'/publishersview',
    name:'publishersview',
    component: PublishersView
   }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
