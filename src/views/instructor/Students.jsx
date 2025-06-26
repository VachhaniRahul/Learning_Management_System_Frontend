import { useState, useEffect } from "react";
import moment from "moment";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import UserData from "../plugin/UserData";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import Spinner from "../../utils/Spinner";

function Students() {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [courseFilter, setCourseFilter] = useState("");
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await api.get(`teacher/student-list/${UserData()?.teacher_id}/`);
            console.log("res.data: ", res.data);
            setStudents(res.data);
            setFilteredStudents(res.data);
            setLoading(false)
        } catch (error) {
            console.log('error', error);
            showToast('error', error.response?.data?.message || 'Something went wrong');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCourseFilterChange = (e) => {
        const value = e.target.value.toLowerCase();
        setCourseFilter(value);
        const filtered = students.filter((s) =>
            s.course.toLowerCase().includes(value)
        );
        setFilteredStudents(filtered);
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
                                <div className="p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <div>
                                        <h3 className="mb-0">Students</h3>
                                        <span>Meet people taking your course.</span>
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <input
                                            type="text"
                                            placeholder="Search by course name"
                                            className="form-control"
                                            value={courseFilter}
                                            onChange={handleCourseFilterChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {filteredStudents.length === 0 && (
                                    <p className="p-3">No students found</p>
                                )}

                                {filteredStudents.map((s, index) => (
                                    <div key={s.id} className="col-lg-4 col-md-6 col-12 d-flex">
                                        <div className="card mb-4 w-100 h-100 d-flex flex-column">
                                            <div className="card-body">
                                                <div className="text-center">
                                                    <img
                                                        src={`http://127.0.0.1:8000${s.image}`}
                                                        className="rounded-circle avatar-xl mb-3"
                                                        style={{
                                                            width: "70px",
                                                            height: "70px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                        }}
                                                        alt="avatar"
                                                    />
                                                    <h4 className="mb-1">{s.full_name}</h4>
                                                    <p className="mb-1">
                                                        <i className="fas fa-book me-1" /> {s.course}
                                                    </p>
                                                    <p className="mb-0">
                                                        <i className="fas fa-map-pin me-1" /> {s.country}
                                                    </p>
                                                </div>
                                                <div className="d-flex justify-content-between py-2 mt-4 fs-6">
                                                    <span>Enrolled</span>
                                                    <span className="text-dark">{moment(s.date).format("DD MMM YYYY")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>
            </section>}
            <BaseFooter />
        </>
    );
}

export default Students;
