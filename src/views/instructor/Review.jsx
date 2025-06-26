import { useState, useEffect } from "react";
import moment from "moment";
import Rater from "react-rater";
import "react-rater/lib/react-rater.css";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import Spinner from "../../utils/Spinner";

function Review() {
    const [reviews, setReviews] = useState([]);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false)
    const [filteredReviews, setFilteredReview] = useState([]);
    const [filters, setFilters] = useState({
        rating: 0,
        courseQuery: "",
        sortBy: "",
    });

    const teacherId = UserData()?.teacher_id

    const fetchReviewsData = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/teacher/review-list/${teacherId}/`)
            console.log(res.data);
            setReviews(res.data);
            const filtered = applyFilter(res.data, filters);
            setFilteredReview(filtered);
            setLoading(false)
        } catch (error) {
            console.log('error', error)
            showToast('error', error.response?.data?.message || 'Something went wrong')
        }
    };

    useEffect(() => {
        fetchReviewsData();
    }, []);

    const applyFilter = (data, filterOptions) => {
        let result = [...data];

        if (filterOptions.rating !== 0) {
            result = result.filter((r) => r.rating === filterOptions.rating);
        }

        if (filterOptions.courseQuery) {
            result = result.filter((r) =>
                r.course.title.toLowerCase().includes(filterOptions.courseQuery.toLowerCase())
            );
        }

        if (filterOptions.sortBy === "Newest") {
            result.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (filterOptions.sortBy === "Oldest") {
            result.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        return result;
    };

    const handleSubmitReply = async (reviewId) => {
        try {
            const res = await api.patch(`teacher/review-detail/${teacherId}/${reviewId}/`, {
                reply: reply,
            })
            console.log(res.data);
            fetchReviewsData();
            setReply("");
            showToast('success', 'Reply Sent')

        } catch (error) {
            console.log(error);
            showToast('error', error.response?.data?.message || 'Something went wrong')
        }
    };

    const handleSortByDate = (e) => {
        const sortValue = e.target.value;
        let sortedReview = [...filteredReviews];
        if (sortValue === "Newest") {
            setFilters((prev) => ({ ...prev, sortBy: 'Newest' }))
            sortedReview.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            setFilters((prev) => ({ ...prev, sortBy: 'Oldest' }))
            sortedReview.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        setFilteredReview(sortedReview);
    };

    const handleSortByRatingChange = (e) => {
        const rating = parseInt(e.target.value);
        console.log(rating);
        if (rating === 0) {
            setFilters((prev) => ({ ...prev, rating: 0 }))
            fetchReviewsData();
        } else {
            const filtered = filteredReviews.filter((review) => review.rating === rating);
            setFilteredReview(filtered);
            setFilters((prev) => ({ ...prev, rating: rating }))
        }
    };

    const handleFilterByCourse = (e) => {
        const query = e.target.value.toLowerCase();
        if (query === "") {
            setFilters((prev) => ({ ...prev, courseQuery: "" }))
            fetchReviewsData();
        } else {
            const filtered = filteredReviews.filter((review) => {
                return review.course.title.toLowerCase().includes(query);
            });
            setFilteredReview(filtered);
            setFilters((prev) => ({ ...prev, courseQuery: query }))
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
                            {/* Card */}
                            <div className="card mb-4">
                                {/* Card header */}
                                <div className="card-header d-lg-flex align-items-center justify-content-between">
                                    <div className="mb-3 mb-lg-0">
                                        <h3 className="mb-0">Reviews</h3>
                                        <span>You have full control to manage your own account setting.</span>
                                    </div>
                                </div>
                                {/* Card body */}
                                <div className="card-body">
                                    {/* Form */}
                                    <form className="row mb-4 gx-2">
                                        <div className="col-xl-7 col-lg-6 col-md-4 col-12 mb-2 mb-lg-0">
                                            <input type="text" className="form-control" placeholder="Search By Couse" onChange={handleFilterByCourse} />
                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-4 col-12 mb-2 mb-lg-0">
                                            {/* Custom select */}
                                            <select className="form-select" onChange={handleSortByRatingChange}>
                                                <option value={0}>Rating</option>
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={3}>3</option>
                                                <option value={4}>4</option>
                                                <option value={5}>5</option>
                                            </select>
                                        </div>
                                        <div className="col-xl-3 col-lg-3 col-md-4 col-12 mb-2 mb-lg-0">
                                            {/* Custom select */}
                                            <select className="form-select" onChange={handleSortByDate}>
                                                <option value="">Sort by</option>
                                                <option value="Newest">Newest</option>
                                                <option value="Oldest">Oldest</option>
                                            </select>
                                        </div>
                                    </form>
                                    {/* List group */}
                                    <ul className="list-group list-group-flush">
                                        {/* List group item */}
                                        {filteredReviews?.map((r, index) => (
                                            <li className="list-group-item p-4 shadow rounded-3 mb-4">
                                                <div className="d-flex">
                                                    <img
                                                        src={r.profile.image}
                                                        alt="avatar"
                                                        className="rounded-circle avatar-lg"
                                                        style={{
                                                            width: "70px",
                                                            height: "70px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                    <div className="ms-3 mt-2">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h4 className="mb-0">{r.profile.full_name}</h4>
                                                                <span>{moment(r.date).format("DD MMM, YYYY")}</span>
                                                            </div>
                                                            <div>
                                                                <a href="#" data-bs-toggle="tooltip" data-placement="top" title="Report Abuse">
                                                                    <i className="fe fe-flag" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="fs-6 me-1 align-top">
                                                                <Rater total={5} rating={r.rating || 0} />
                                                            </span>
                                                            <span className="me-1">for</span>
                                                            <span className="h5">{r.course?.title}</span>
                                                            <p className="mt-2">
                                                                <span className="fw-bold me-2">
                                                                    Review <i className="fas fa-arrow-right"></i>
                                                                </span>
                                                                {r.review}
                                                            </p>
                                                            <p className="mt-2">
                                                                <span className="fw-bold me-2">
                                                                    Response <i className="fas fa-arrow-right"></i>
                                                                </span>
                                                                {r.reply || "No Reply"}
                                                            </p>
                                                            <p>
                                                                <button class="btn btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${r.id}`} aria-expanded="false" aria-controls={`collapse${r.id}`}>
                                                                    Send Response
                                                                </button>
                                                            </p>
                                                            <div class="collapse" id={`collapse${r.id}`}>
                                                                <div class="card card-body">
                                                                    <div>
                                                                        <div class="mb-3">
                                                                            <label for="exampleInputEmail1" class="form-label">
                                                                                Write Response
                                                                            </label>
                                                                            <textarea name="" id="" cols="30" className="form-control" rows="4" value={reply} onChange={(e) => setReply(e.target.value)}></textarea>
                                                                        </div>

                                                                        <button type="submit" class="btn btn-primary" onClick={() => handleSubmitReply(r.id)}>
                                                                            Send Response <i className="fas fa-paper-plane"> </i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}

                                        {filteredReviews?.length < 1 && <p className="mt-4 p-3">No reviews</p>}
                                    </ul>
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

export default Review;
