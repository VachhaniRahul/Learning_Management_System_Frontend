import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";

import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import { CartContext } from "../plugin/Context";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import Spinner from "../../utils/Spinner";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [cartCount, setCartCount] = useContext(CartContext);
    const [loading, setLoading] = useState(false)

    const fetchWishlist = async() => {
        setLoading(true)
        try {
            const res = await api.get(`student/wishlist/${UserData()?.user_id}/`)
            console.log(res.data);
            setWishlist(res.data);
            setLoading(false)
        } catch (error) {
            console.log('Error in wishlist', error)
            showToast('error', 'Something went wrong in wishlist')
        }
    };
    const country = GetCurrentAddress()?.country;

    useEffect(() => {
        fetchWishlist();
    }, []);

    const addToCart = async (courseId, userId, country, cartId) => {
        const formdata = new FormData();

        formdata.append("course_id", courseId);
        formdata.append("user_id", userId);
        formdata.append("country_name", country);
        formdata.append("cart_id", cartId);

        try {
            const res = await api.post(`course/cart/`, formdata)
            console.log(res.data);
            showToast('success', 'Added To Cart')
            const new_res = await api.get(`course/cart-list/${CartId()}/`)
            setCartCount(new_res.data?.length);
                
        } catch (error) {
            console.log(error);
            showToast('error', 'Something went wrong in wishlist')
        }
    };

    const addToWishlist = async (courseId) => {
        const formdata = new FormData();
        formdata.append("user_id", UserData()?.user_id);
        formdata.append("course_id", courseId);
        try {
            const res = await api.post(`student/wishlist/${UserData()?.user_id}/`, formdata)
            console.log(res.data)
            showToast('success', res.data.message)
            fetchWishlist()
        }
        catch (error) {
            console.log(error)
            showToast('error', error.response?.data?.message)
            // showToast('error', 'Something went wrong')
        }
    };

    return (
        <>
            <BaseHeader />
            {loading ? <Spinner /> :
            <section className="pt-5 pb-5">
                <div className="container">
                    {/* Header Here */}
                    <Header />
                    <div className="row mt-0 mt-md-4">
                        {/* Sidebar Here */}
                        <Sidebar />
                        <div className="col-lg-9 col-md-8 col-12">
                            <h4 className="mb-0 mb-4">
                                {" "}
                                <i className="fas fa-heart"></i> Wishlist{" "}
                            </h4>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                                        {wishlist?.map((w, index) => (
                                            <div className="col-lg-4" key={index}>
                                                {/* Card */}
                                                <div className="card card-hover">
                                                    <Link to={`/course-detail/${w.course.slug}/`}>
                                                        <img
                                                            src={w.course.image}
                                                            alt="course"
                                                            className="card-img-top"
                                                            style={{
                                                                width: "100%",
                                                                height: "200px",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                    </Link>
                                                    {/* Card Body */}
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <div>
                                                                <span className="badge bg-info">{w.course.level}</span>
                                                                <span className="badge bg-success ms-2">{w.course.language}</span>
                                                            </div>
                                                            <a onClick={() => addToWishlist(w.course?.course_id)} className="fs-5">
                                                                <i className="fas fa-heart text-danger align-middle" />
                                                            </a>
                                                        </div>
                                                        <h4 className="mb-2 text-truncate-line-2 ">
                                                            <Link to={`/course-detail/${w.course.slug}/`} className="text-inherit text-decoration-none text-dark fs-5">
                                                                {w.course.title}
                                                            </Link>
                                                        </h4>
                                                        <small>By: {w.course?.teacher?.full_name}</small> <br />
                                                        <small>
                                                            {w.course.student_count} Student
                                                            {w.course.students?.length > 1 && "s"}
                                                        </small>{" "}
                                                        <br />
                                                        <div className="lh-1 mt-3 d-flex">
                                                            <span className="align-text-top">
                                                                <span className="fs-6">
                                                                    <Rater total={5} rating={w.course.average_rating?.avg_rating || 0} />
                                                                </span>
                                                            </span>
                                                            <span className="text-warning">4.5</span>
                                                            <span className="fs-6 ms-2">({w.course.reviews?.length} Reviews)</span>
                                                        </div>
                                                    </div>
                                                    {/* Card Footer */}
                                                    <div className="card-footer">
                                                        <div className="row align-items-center g-0">
                                                            <div className="col">
                                                                <h5 className="mb-0">{w.course.price} RS</h5>
                                                            </div>
                                                            <div className="col-auto">
                                                                <button type="button" onClick={() => addToCart(w.course.id, UserData()?.user_id, country, CartId())} className="text-inherit text-decoration-none btn btn-primary me-2">
                                                                    <i className="fas fa-shopping-cart text-primary text-white" />
                                                                </button>
                                                                <Link to={""} className="text-inherit text-decoration-none btn btn-primary">
                                                                    Enroll Now <i className="fas fa-arrow-right text-primary align-middle me-2 text-white" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {wishlist.length < 1 && <p className="mt-4 p-3">No item in wishlist</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>}

            <BaseFooter />
        </>
    );
}

export default Wishlist;
