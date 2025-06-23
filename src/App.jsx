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
          <Route path="/checkout/:order_oid" element={<Checkout />} />
          <Route path="/payment-success/:order_oid" element={<Success />} />
          <Route path="/search" element={<Search/>} />

          {/* Student Dashboard*/}
          <Route path="/student/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/student/courses" element={<Courses/>} />
          <Route path="/student/courses/:enrollment_id" element={<StudentCourseDetail/>} />
        
          <Route path="/student/profile" element={<Profile/>}/>
          <Route path="/student/wishlist" element={<Wishlist/>}/>
          <Route path="/student/change-password" element={<ChangePassword />} />

        </Routes>
      </MainWrapper>
    </BrowserRouter>
  )
}

export default App
