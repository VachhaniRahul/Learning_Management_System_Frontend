import { useState, useEffect, useContext } from "react"
import { Route, Routes, BrowserRouter } from "react-router-dom"

import MainWrapper from "./layouts/MainWrapper"
import PrivateRoute from "./layouts/PrivateRoutes"
import api from "./utils/axios"
import CartId from "./views/plugin/CartId"
import { CartContext } from "./views/plugin/Context"

import Register from "./views/auth/Register"
import Login from './views/auth/Login'
import Logout from "./views/auth/Logout"
import ForgotPassword from "./views/auth/ForgotPassword"
import CreateNewPassword from "./views/auth/CreateNewPassword"
import Index from "./views/base/Index"
import CourseDetail from "./views/base/CourseDetail"
import Cart from "./views/base/Cart"
import Checkout from "./views/base/Checkout"
import Success from "./views/base/Success"
import Search from "./views/base/Search"
import Dashboard from "./views/student/Dashboard"
import Courses from "./views/student/Courses"
import Profile from "./views/student/Profile"
import ChangePassword from "./views/student/ChangePassword"
import Wishlist from "./views/student/Wishlist"
import StudentCourseDetail from "./views/student/CourseDetail"
import IDashboard from "./views/instructor/Dashboard"
import ICourses from "./views/instructor/Courses"
import Earning from "./views/instructor/Earning"
import TeacherNotification from "./views/instructor/TeacherNotification"
import IProfile from "./views/instructor/Profile"
import IReview from "./views/instructor/Review"
import Students from "./views/instructor/Students"
import IChangePassword from "./views/instructor/ChangePassword"
import IQA from "./views/instructor/QA"
import IOrders from "./views/instructor/Orders"
import Coupon from "./views/instructor/Coupon"
import CourseCreate from "./views/instructor/CourseCreate"
import CourseEdit from "./views/instructor/old/CourseEdit"

function App() {
  const [cartCount, setCartCount] = useContext(CartContext);

  useEffect(() => {
    api.get(`course/cart-list/${CartId()}/`).then((res) => {
      setCartCount(res.data?.length || 0)
    })
  }, [])

  return (
    <BrowserRouter>
      <MainWrapper>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-new-password" element={<CreateNewPassword />} />

          {/* Base Routes */}
          <Route path="" element={<Index />} />
          <Route path="/course-detail/:slug" element={<CourseDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route element={<PrivateRoute />}>
            <Route path="/checkout/:order_oid" element={<Checkout />} />
            <Route path="/payment-success/:order_oid" element={<Success />} />
          </Route>
          <Route path="/search" element={<Search />} />

          {/* Student Dashboard*/}
          <Route element={<PrivateRoute />}>
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/student/courses" element={<Courses />} />
            <Route path="/student/courses/:enrollment_id" element={<StudentCourseDetail />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/wishlist" element={<Wishlist />} />
            <Route path="/student/change-password" element={<ChangePassword />} />
          </Route>


          {/* Teacher Dashboard*/}
          <Route element={<PrivateRoute />}>

            <Route path="/instructor/dashboard" element={<IDashboard />} />
            <Route path="/instructor/courses" element={<ICourses />} />
            <Route path="/instructor/create-course/" element={<CourseCreate />} />
            <Route path="/instructor/edit-course/:course_id" element={<CourseEdit />} />
            <Route path="/instructor/earning" element={<Earning />} />
            <Route path="/instructor/notifications" element={<TeacherNotification />} />
            <Route path="/instructor/profile" element={<IProfile />} />
            <Route path="/instructor/reviews" element={<IReview />} />
            <Route path="/instructor/students" element={<Students />} />
            <Route path="/instructor/change-password" element={<IChangePassword />} />
            <Route path="/instructor/question-answer" element={<IQA />} />
            <Route path="/instructor/orders" element={<IOrders />} />
            <Route path="/instructor/coupon" element={<Coupon />} />
          </Route>

        </Routes>
      </MainWrapper>
    </BrowserRouter>
  )
}

export default App
