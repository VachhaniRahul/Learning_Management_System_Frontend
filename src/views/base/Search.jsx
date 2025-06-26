

import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import GetCurrentAddress from "../plugin/UserCountry";
import UserData from "../plugin/UserData";
import CartId from "../plugin/CartId";
import { CartContext } from "../plugin/Context";
import { showToast } from "../../utils/toast";
import apiInstance from "../../utils/axios";

function Search() {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cartCount, setCartCount] = useContext(CartContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [enrollCourse, setEnrollCourse] = useState('')


    const location = useLocation();
    const navigate = useNavigate();

    const country = GetCurrentAddress().country;
    const userId = UserData()?.user_id;
    const cartId = CartId();

    const searchParam = new URLSearchParams(location.search).get("search") || "";

    const fetchCourses = async (query = "") => {
        setIsLoading(true);
        try {
            const response = await apiInstance.get(`/course/search/?query=${query}`);
            setCourses(response.data);
        } catch (error) {
            console.log(error);
            showToast("error", "Something went wrong while fetching courses");
        } finally {
            setIsLoading(false);
        }
    };
    const fetchEnrollCourse = async () => {
        try {
            console.log(userId)
            const res = await apiInstance.get(`user/enrollment-course-id/${userId}/`)
            setEnrollCourse(res.data)
        } catch (error) {
            console.log(error)
            showToast('error', error.response?.data?.message || 'Something went wrong')
        }
    }

    useEffect(() => {
        setSearchQuery(searchParam);
        fetchCourses(searchParam);
        if (userId){
            fetchEnrollCourse()
        }
    }, [searchParam]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        navigate(`?search=${encodeURIComponent(query)}`);
    };

    const addToCart = async (courseId, userId, country, cartId) => {
        const formdata = new FormData();
        formdata.append("course_id", courseId);
        formdata.append("user_id", userId);
        formdata.append("country_name", country);
        formdata.append("cart_id", cartId);

        try {
            await apiInstance.post(`course/cart/`, formdata).then((res) => {
                showToast('success', 'Added To Cart');
                apiInstance.get(`course/cart-list/${CartId()}/`).then((res) => {
                    setCartCount(res.data?.length);
                });
            });
        } catch (error) {
            console.log(error);
            showToast('error', 'Something went wrong');
        }
    };

    return (
        <>
            <BaseHeader />
            <section className="mb-5" style={{ marginTop: "100px" }}>
                <div className="container mb-lg-8">
                    <div className="row mb-5 mt-3">
                        <div className="col-12">
                            <div className="mb-6">
                                <h2 className="mb-1 h1">
                                    Showing Results for "{searchQuery || "No Search Query"}"
                                </h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-6">
                                <input
                                    type="text"
                                    className="form-control lg mt-3"
                                    placeholder="Search Courses..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                                {courses?.map((c, index) =>{ 
                                    const matchedEnrollment = Array.isArray(enrollCourse)
                                        ? enrollCourse.find((e) => String(e.course_id) === String(c.course_id))
                                        : null;
                                    console.log(enrollCourse)
                                    
                                    return (
                                    <div className="col" key={index}>
                                        <div className="card card-hover">
                                            <Link to={`/course-detail/${c.slug}/`}>
                                                <img
                                                    src={c.image}
                                                    alt="course"
                                                    className="card-img-top"
                                                    style={{
                                                        width: "100%",
                                                        height: "200px",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                            </Link>
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div>
                                                        <span className="badge bg-info">{c.level}</span>
                                                        <span className="badge bg-success ms-2">{c.language}</span>
                                                    </div>
                                                    <span className="fs-5">
                                                        <i className="fas fa-heart text-danger align-middle" />
                                                    </span>
                                                </div>
                                                <h4 className="mb-2 text-truncate-line-2">
                                                    <Link
                                                        to={`/course-detail/${c.slug}/`}
                                                        className="text-inherit text-decoration-none text-dark fs-5"
                                                    >
                                                        {c.title}
                                                    </Link>
                                                </h4>
                                                <small>By: {c.teacher.full_name}</small>
                                                <br />
                                                <small>
                                                    {c.students?.length} Student{c.students?.length > 1 && "s"}
                                                </small>
                                                <br />
                                                <div className="lh-1 mt-3 d-flex">
                                                    <span className="align-text-top fs-6">
                                                        <Rater total={5} rating={c.average_rating.avg_rating || 0} />
                                                    </span>
                                                    <span className="text-warning ms-2">{c.average_rating?.avg_rating?.toFixed(1) || 0}</span>
                                                    <span className="fs-6 ms-2">({c.reviews?.length} Reviews)</span>
                                                </div>
                                            </div>
                                            <div className="card-footer">
                                                <div className="row align-items-center g-0">
                                                    <div className="col">
                                                        <h5 className="mb-0">{c.price} RS</h5>
                                                    </div>
                                                    <div className="col-auto">
                                                        {c.students?.includes(userId) ? (
                                                                <Link to={`/student/courses/${matchedEnrollment?.enrollment_id}`} className="text-inherit text-decoration-none btn btn-success">
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
                                )})}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <BaseFooter />
        </>
    );
}

export default Search;
