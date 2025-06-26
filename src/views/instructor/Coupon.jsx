import { useState, useEffect } from "react";
import moment from "moment";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import UserData from "../plugin/UserData";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import Spinner from "../../utils/Spinner";

function Coupon() {
    const [coupons, setCoupons] = useState([]);
    const [filteredCoupons, setFilteredCoupons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [createCoupon, setCreateCoupon] = useState({ code: "", discount: 0, course: "" });
    const [selectedCoupon, setSelectedCoupon] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState()


    const [show, setShow] = useState(false);
    const [showAddCoupon, setShowAddCoupon] = useState(false);

    const teacherId = UserData()?.teacher_id;

    const handleClose = () => setShow(false);
    const handleShow = (coupon) => {
        setShow(true);
        setSelectedCoupon(coupon);
        setCreateCoupon({
            code: coupon.code,
            discount: coupon.discount,
            course: coupon.course || ""
        });
    };

    const handleAddCouponClose = () => setShowAddCoupon(false);
    const handleAddCouponShow = () => setShowAddCoupon(true);

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await api.get(`teacher/coupon-list/${teacherId}/`);
            setCoupons(res.data);
            setFilteredCoupons(res.data);
            if (searchQuery) {
                const filtered = res.data.filter(c =>
                    c.title?.toLowerCase().includes(searchQuery))
                setFilteredCoupons(filtered);
            }
            setLoading(false)
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Something went wrong');
        }
    };

    const fetchCourses = async () => {
        setLoading(true)
        try {
            const res = await api.get(`teacher/courses/${teacherId}`);
            setCourses(res.data);
            setLoading(false)
        } catch (error) {
            showToast('error', 'Failed to load courses');
        }
    };

    useEffect(() => {
        
        fetchCoupons();
        fetchCourses();
        

    }, []);

    const handleCreateCouponChange = (event) => {
        setCreateCoupon({
            ...createCoupon,
            [event.target.name]: event.target.value,
        });
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append("code", createCoupon.code);
        formdata.append("discount", createCoupon.discount);
        formdata.append("course", createCoupon.course);

        try {
            await api.post(`teacher/coupon-list/${teacherId}/`, formdata);
            fetchCoupons();
            handleAddCouponClose();
            showToast('success', 'Coupon created successfully');
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        try {
            await api.delete(`teacher/coupon-list-detail/${teacherId}/${couponId}/`);
            fetchCoupons();
            showToast('success', 'Coupon deleted successfully');
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleCouponUpdateSubmit = async (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append("teacher", teacherId);
        formdata.append("code", createCoupon.code);
        formdata.append("discount", createCoupon.discount);
        formdata.append("course", createCoupon.course);

        try {
            await api.patch(`teacher/coupon-list-detail/${teacherId}/${selectedCoupon.id}/`, formdata);
            fetchCoupons();
            handleClose();
            showToast('success', 'Coupon updated successfully');
            setCreateCoupon({ code: '', discount: '', course: '' });

        } catch (error) {
            showToast('error', error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        if (query === "") {
            setFilteredCoupons(coupons);
        } else {
            const filtered = coupons.filter(c =>
                c.title?.toLowerCase().includes(query)
            );
            setFilteredCoupons(filtered);
        }
    };

    return (
        <>
            <BaseHeader />
            {loading ? <Spinner /> :
                <section className="pt-5 pb-5">
                    <div className="container">
                        <Header />
                        <div className="row mt-0 mt-md-4">
                            <Sidebar />
                            <div className="col-lg-9 col-md-8 col-12">
                                <div className="card mb-4">
                                    <div className="card-header d-lg-flex align-items-center justify-content-between">
                                        <div className="mb-3 mb-lg-0">
                                            <h3 className="mb-0">Coupons</h3>
                                            <span>Manage all your coupons from here</span>
                                        </div>
                                        <button className="btn btn-primary" onClick={handleAddCouponShow}>
                                            Add Coupon
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <input
                                            type="text"
                                            placeholder="Search by Course Name"
                                            className="form-control mb-4"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                        />
                                        <ul className="list-group list-group-flush">
                                            {filteredCoupons?.map((c) => (
                                                <li className="list-group-item p-4 shadow rounded-3 mb-3" key={c.id}>
                                                    <div className="d-flex">
                                                        <div className="ms-3 mt-2">
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <h4 className="mb-0">{c.code}</h4>
                                                                    <span>{c.used_by} Student</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="mt-2">
                                                                    <span className="me-2 fw-bold">
                                                                        Discount: <span className="fw-light">{c.discount} RS</span>
                                                                    </span>
                                                                </p>
                                                                <p className="mt-1">
                                                                    <span className="me-2 fw-bold">
                                                                        Course: <span className="fw-light">{c.title}</span>
                                                                    </span>
                                                                </p>
                                                                <p className="mt-1">
                                                                    <span className="me-2 fw-bold">
                                                                        Date Created: <span className="fw-light">{moment(c.date).format("DD MMM, YYYY")}</span>
                                                                    </span>
                                                                </p>
                                                                <p>
                                                                    <button className="btn btn-outline-secondary" type="button" onClick={() => handleShow(c)}>
                                                                        Update Coupon
                                                                    </button>
                                                                    <button className="btn btn-danger ms-2" type="button" onClick={() => handleDeleteCoupon(c.id)}>
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }

            {/* Update Modal */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Coupon - <span className="fw-bold">{selectedCoupon.code}</span></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleCouponUpdateSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Code</label>
                            <input type="text" className="form-control" name="code" value={createCoupon.code} onChange={handleCreateCouponChange} />
                            <label className="form-label mt-3">Discount</label>
                            <input type="number" className="form-control" name="discount" value={createCoupon.discount} onChange={handleCreateCouponChange} />
                            <label className="form-label mt-3">Course</label>
                            <select className="form-select" name="course" value={createCoupon.course} onChange={handleCreateCouponChange}>
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Update Coupon</button>
                        <Button className="ms-2" variant="secondary" onClick={handleClose}>Close</Button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Add Modal */}
            <Modal show={showAddCoupon} onHide={handleAddCouponClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Coupon</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleCouponSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Code</label>
                            <input type="text" className="form-control" name="code" value={createCoupon.code} onChange={handleCreateCouponChange} />
                            <label className="form-label mt-3">Discount</label>
                            <input type="number" className="form-control" name="discount" value={createCoupon.discount} onChange={handleCreateCouponChange} />
                            <label className="form-label mt-3">Course</label>
                            <select className="form-select" name="course" value={createCoupon.course} onChange={handleCreateCouponChange}>
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Create Coupon</button>
                        <Button className="ms-2" variant="secondary" onClick={handleAddCouponClose}>Close</Button>
                    </form>
                </Modal.Body>
            </Modal>

            <BaseFooter />
        </>
    );
}

export default Coupon;
