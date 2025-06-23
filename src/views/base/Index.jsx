import { useEffect, useState, useContext } from "react";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import CartId from "../plugin/CartId";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import { CartContext } from "../plugin/Context";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";

function Index() {
    const [courses, setCourses] = useState([]);
    const [enrollCourse, setEnrollCourse] = useState('')
    const [isLoading, setIsLoading] = useState(true);
    const [cartCount, setCartCount] = useContext(CartContext);

    const country = GetCurrentAddress().country;
    const userId = UserData()?.user_id;
    const cartId = CartId();


    const fetchCourse = async () => {
        setIsLoading(true);
        try {
            await api.get(`/course/course-list/`).then((res) => {
                setCourses(res.data);
                setIsLoading(false);
            });
        } catch (error) {
            console.log(error);
        }
    };

    const fetchEnrollCourse = async () => {
        try {
            const res = await api.get(`user/enrollment-course-id/${userId}/`)
            setEnrollCourse(res.data)
        } catch (error) {
            showToast('error', error.response.data?.message || 'Something went wrong')
        }
    }

    useEffect(() => {
        fetchCourse();
        const fetchData = async () => {
            await api.get(`course/cart-list/${CartId()}/`).then((res) => {
                setCartCount(res.data?.length);
            });
        }
        fetchData()
        if (userId) {
            fetchEnrollCourse()
        }

    }, []);

    const addToCart = async (courseId, userId, country, cartId) => {
        const formdata = new FormData();
        console.log('U', userId)
        formdata.append("course_id", courseId);
        formdata.append("user_id", userId);
        formdata.append("country_name", country);
        formdata.append("cart_id", cartId);
        if (!userId || userId === 'undefined') {
            showToast('error', 'Please login then you can add to cart')
            setAddToCartBtn("Add To Cart");
            return
        }

        try {
            await api.post(`course/cart/`, formdata).then((res) => {
                console.log(res.data);
                // Toast().fire({
                //     title: "Added To Cart",
                //     icon: "success",
                // });
                showToast('success', 'Added To Cart')

                // Set cart count after adding to cart
                api.get(`course/cart-list/${CartId()}/`).then((res) => {
                    setCartCount(res.data?.length);
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    // Pagination
    const itemsPerPage = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = courses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(courses.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    const addToWishlist = (courseId) => {
        const formdata = new FormData();
        formdata.append("user_id", UserData()?.user_id);
        formdata.append("course_id", courseId);

        api.post(`student/wishlist/${UserData()?.user_id}/`, formdata).then((res) => {
            console.log(res.data);
            // Toast().fire({
            //     icon: "success",
            //     title: res.data.message,
            // });
            showToast('success', res.data.message)
        });
    };

    return (
        <>
            <BaseHeader />

            <section className="py-lg-8 py-5">
                {/* container */}
                <div className="container my-lg-8">
                    {/* row */}
                    <div className="row align-items-center">
                        {/* col */}
                        <div className="col-lg-6 mb-6 mb-lg-0">
                            <div>
                                {/* heading */}
                                <h5 className="text-dark mb-4">
                                    <i className="fe fe-check icon-xxs icon-shape bg-light-success text-success rounded-circle me-2" />
                                    Most trusted education platform
                                </h5>
                                {/* heading */}
                                <h1 className="display-3 fw-bold mb-3">Grow your skills and advance career</h1>
                                {/* para */}
                                <p className="pe-lg-10 mb-5">Start, switch, or advance your career with more than 5,000 courses, Professional Certificates, and degrees from world-class universities and companies.</p>
                                {/* btn */}
                                <a href="#" className="btn btn-primary fs-4 text-inherit ms-3">
                                    Join Free Now <i className="fas fa-plus"></i>
                                </a>
                                <a href="https://www.youtube.com/watch?v=Nfzi7034Kbg" className="btn btn-outline-success fs-4 text-inherit ms-3">
                                    Watch Demo <i className="fas fa-video"></i>
                                </a>
                            </div>
                        </div>
                        {/* col */}
                        <div className="col-lg-6 d-flex justify-content-center">
                            {/* images */}
                            <div className="position-relative">
                                <img src="data:image/jpeg;base64,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" alt="girl" className="end-0 bottom-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pb-8">
                <div className="container mb-lg-8">
                    {/* row */}
                    <div className="row mb-5">
                        <div className="col-md-6 col-lg-3 border-top-md border-top pb-4  border-end-md">
                            {/* text */}
                            <div className="py-7 text-center">
                                <div className="mb-3">
                                    <i className="fe fe-award fs-2 text-info" />
                                </div>
                                <div className="lh-1">
                                    <h2 className="mb-1">316,000+</h2>
                                    <span>Qualified Instructor</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 border-top-md border-top border-end-lg">
                            {/* icon */}
                            <div className="py-7 text-center">
                                <div className="mb-3">
                                    <i className="fe fe-users fs-2 text-warning" />
                                </div>
                                {/* text */}
                                <div className="lh-1">
                                    <h2 className="mb-1">1.8 Billion+</h2>
                                    <span>Course enrolments</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 border-top-lg border-top border-end-md">
                            {/* icon */}
                            <div className="py-7 text-center">
                                <div className="mb-3">
                                    <i className="fe fe-tv fs-2 text-primary" />
                                </div>
                                {/* text */}
                                <div className="lh-1">
                                    <h2 className="mb-1">41,000+</h2>
                                    <span>Courses in 42 languages</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 border-top-lg border-top">
                            {/* icon */}
                            <div className="py-7 text-center">
                                <div className="mb-3">
                                    <i className="fe fe-film fs-2 text-success" />
                                </div>
                                {/* text */}
                                <div className="lh-1">
                                    <h2 className="mb-1">179,000+</h2>
                                    <span>Online Videos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-5">
                <div className="container mb-lg-8 ">
                    <div className="row mb-5 mt-3">
                        {/* col */}
                        <div className="col-12">
                            <div className="mb-6">
                                <h2 className="mb-1 h1">🔥Most Popular Courses</h2>
                                <p>These are the most popular courses among Geeks Courses learners worldwide in year 2022</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                                {currentItems?.map((c, index) => {
                                    const matchedEnrollment = Array.isArray(enrollCourse)
                                        ? enrollCourse.find((e) => String(e.course_id) === String(c.course_id))
                                        : null;
                                    console.log(enrollCourse)

                                    return (
                                        <div className="col">
                                            {/* Card */}
                                            <div className="card card-hover h-100">
                                                <Link to={`/course-detail/${c.slug}/`}>
                                                    <img
                                                        src={c.image}
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
                                                            <span className="badge bg-info">{c.level}</span>
                                                            <span className="badge bg-success ms-2">{c.language}</span>
                                                        </div>
                                                        <a onClick={() => addToWishlist(c.course_id)} className="fs-5">
                                                            <i className="fas fa-heart text-danger align-middle" />
                                                        </a>
                                                    </div>
                                                    <h4 className="mb-2 text-truncate-line-2 ">
                                                        <Link to={`/course-detail/${c.slug}/`} className="text-inherit text-decoration-none text-dark fs-5">
                                                            {c.title}
                                                        </Link>
                                                    </h4>

                                                    <small>By: {c.teacher.full_name}</small> <br />
                                                    <small>
                                                        {c.students?.length} Student
                                                        {c.students?.length > 1 && "s"}
                                                    </small>{" "}
                                                    <br />
                                                    <div className="lh-1 mt-3 d-flex">
                                                        <span className="align-text-top">
                                                            <span className="fs-6">
                                                                <Rater total={5} rating={c.average_rating.avg_rating || 0} />
                                                            </span>
                                                        </span>
                                                        <span className="text-warning">{c.average_rating.avg_rating || 0}</span>
                                                        <span className="fs-6 ms-2">({c.reviews?.length} Reviews)</span>
                                                    </div>
                                                </div>
                                                {/* Card Footer */}
                                                <div className="card-footer">
                                                    <div className="row align-items-center g-0">
                                                        <div className="col">
                                                            <h5 className="mb-0">{c.price}</h5>
                                                        </div>
                                                        <div className="col-auto">

                                                            {c.students?.includes(userId) ? (
                                                                <Link to={`/student/courses/${matchedEnrollment?.enrollment_id   }`} className="text-inherit text-decoration-none btn btn-success">
                                                                    Go To Course <i className="fas fa-arrow-right text-white ms-2" />
                                                                </Link>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => addToCart(c.course_id, userId, country, cartId)}
                                                                        className="text-inherit text-decoration-none btn btn-primary me-2"
                                                                    >
                                                                        <i className="fas fa-shopping-cart text-white" />
                                                                    </button>
                                                                    <Link to={""} className="text-inherit text-decoration-none btn btn-primary">
                                                                        Enroll Now <i className="fas fa-arrow-right text-white ms-2" />
                                                                    </Link>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <nav className="d-flex mt-5">
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                        <button className="page-link me-1" onClick={() => setCurrentPage(currentPage - 1)}>
                                            <i className="ci-arrow-left me-2" />
                                            Previous
                                        </button>
                                    </li>
                                </ul>
                                <ul className="pagination">
                                    {pageNumbers.map((number) => (
                                        <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                                            <button className="page-link" onClick={() => setCurrentPage(number)}>
                                                {number}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                        <button className="page-link ms-1" onClick={() => setCurrentPage(currentPage + 1)}>
                                            Next
                                            <i className="ci-arrow-right ms-3" />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>

            <section className="my-8 py-lg-8">
                {/* container */}
                <div className="container">
                    {/* row */}
                    <div className="row align-items-center bg-primary gx-0 rounded-3 mt-5">
                        {/* col */}
                        <div className="col-lg-6 col-12 d-none d-lg-block">
                            <div className="d-flex justify-content-center pt-4">
                                {/* img */}
                                <div className="position-relative">
                                    <img src="https://desphixs.com/geeks/assets/images/png/cta-instructor-1.png" alt="image" className="img-fluid mt-n8" />
                                    <div className="ms-n8 position-absolute bottom-0 start-0 mb-6">
                                        <img src="https://desphixs.com/geeks/assets/images/svg/dollor.svg" alt="dollor" />
                                    </div>
                                    {/* img */}
                                    <div className="me-n4 position-absolute top-0 end-0">
                                        <img src="https://desphixs.com/geeks/assets/images/svg/graph.svg" alt="graph" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5 col-12">
                            <div className="text-white p-5 p-lg-0">
                                {/* text */}
                                <h2 className="h1 text-white">Become an instructor today</h2>
                                <p className="mb-0">Instructors from around the world teach millions of students on Geeks. We provide the tools and skills to teach what you love.</p>
                                <a href="#" className="btn bg-white text-dark fw-bold mt-4">
                                    Start Teaching Today <i className="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-200 pt-8 pb-8 mt-5">
                <div className="container pb-8">
                    {/* row */}
                    <div className="row mb-lg-8 mb-5">
                        <div className="offset-lg-1 col-lg-10 col-12">
                            <div className="row align-items-center">
                                {/* col */}
                                <div className="col-lg-6 col-md-8">
                                    {/* rating */}
                                    <div>
                                        <div className="mb-3">
                                            <span className="lh-1">
                                                <span className="align-text-top ms-2">
                                                    <i className="fas fa-star text-warning"></i>
                                                    <i className="fas fa-star text-warning"></i>
                                                    <i className="fas fa-star text-warning"></i>
                                                    <i className="fas fa-star text-warning"></i>
                                                    <i className="fas fa-star text-warning"></i>
                                                </span>
                                                <span className="text-dark fw-semibold">4.5/5.0</span>
                                            </span>
                                            <span className="ms-2">(Based on 3265 ratings)</span>
                                        </div>
                                        {/* heading */}
                                        <h2 className="h1">What our students say</h2>
                                        <p className="mb-0">
                                            Hear from
                                            <span className="text-dark">teachers</span>,<span className="text-dark">trainers</span>, and
                                            <span className="text-dark">leaders</span>
                                            in the learning space about how Geeks empowers them to provide quality online learning experiences.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-4 text-md-end mt-4 mt-md-0">
                                    {/* btn */}
                                    <a href="#" className="btn btn-primary">
                                        View Reviews
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* row */}
                    <div className="row">
                        {/* col */}
                        <div className="col-md-12">
                            <div className="position-relative">
                                {/* controls */}
                                {/* slider */}
                                <div className="sliderTestimonial">
                                    {/* item */}
                                    <div className="row">
                                        <div className="col-lg-4">
                                            <div className="item">
                                                <div className="card">
                                                    <div className="card-body text-center p-6">
                                                        {/* img */}
                                                        <img src="../../assets/images/avatar/avatar-1.jpg" alt="avatar" className="avatar avatar-lg rounded-circle" />
                                                        <p className="mb-0 mt-3">“The generated lorem Ipsum is therefore always free from repetition, injected humour, or words etc generate lorem Ipsum which looks racteristic reasonable.”</p>
                                                        {/* rating */}
                                                        <div className="lh-1 mb-3 mt-4">
                                                            <span className="fs-6 align-top">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                            </span>
                                                            <span className="text-warning">5</span>
                                                            {/* text */}
                                                        </div>
                                                        <h3 className="mb-0 h4">Gladys Colbert</h3>
                                                        <span>Software Engineer at Palantir</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="item">
                                                <div className="card">
                                                    <div className="card-body text-center p-6">
                                                        {/* img */}
                                                        <img src="../../assets/images/avatar/avatar-1.jpg" alt="avatar" className="avatar avatar-lg rounded-circle" />
                                                        <p className="mb-0 mt-3">“The generated lorem Ipsum is therefore always free from repetition, injected humour, or words etc generate lorem Ipsum which looks racteristic reasonable.”</p>
                                                        {/* rating */}
                                                        <div className="lh-1 mb-3 mt-4">
                                                            <span className="fs-6 align-top">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                            </span>
                                                            <span className="text-warning">5</span>
                                                            {/* text */}
                                                        </div>
                                                        <h3 className="mb-0 h4">Gladys Colbert</h3>
                                                        <span>Software Engineer at Palantir</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4">
                                            <div className="item">
                                                <div className="card">
                                                    <div className="card-body text-center p-6">
                                                        {/* img */}
                                                        <img src="../../assets/images/avatar/avatar-1.jpg" alt="avatar" className="avatar avatar-lg rounded-circle" />
                                                        <p className="mb-0 mt-3">“The generated lorem Ipsum is therefore always free from repetition, injected humour, or words etc generate lorem Ipsum which looks racteristic reasonable.”</p>
                                                        {/* rating */}
                                                        <div className="lh-1 mb-3 mt-4">
                                                            <span className="fs-6 align-top">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width={11} height={11} fill="currentColor" className="bi bi-star-fill text-warning" viewBox="0 0 16 16">
                                                                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                                </svg>
                                                            </span>
                                                            <span className="text-warning">5</span>
                                                            {/* text */}
                                                        </div>
                                                        <h3 className="mb-0 h4">Gladys Colbert</h3>
                                                        <span>Software Engineer at Palantir</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BaseFooter />
        </>
    );
}

export default Index;
