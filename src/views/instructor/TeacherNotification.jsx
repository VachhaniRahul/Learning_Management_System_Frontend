import { useState, useEffect } from "react";
import moment from "moment";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";

import UserData from "../plugin/UserData";
import Toast from "../plugin/Toast";
import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import Spinner from "../../utils/Spinner";

function TeacherNotification() {
    const [noti, setNoti] = useState([]);
    const [loading, setLoading] = useState(false)

    const teacherId = UserData()?.teacher_id

    const fetchNoti = async() => {
        setLoading(true)
        try {
            const res = await api.get(`teacher/notification-list/${teacherId}/`)
            setNoti(res.data);
            console.log(res.data);
            setLoading(false)
        } catch (error) {
            console.log('error', error)
            showToast('error', error.response?.data?.message || 'Something went wrong')
        }
       
    };

    useEffect(() => {
        fetchNoti();
    }, []);

    const handleMarkAsSeen = async(notiId) => {
        try {
            const res = await api.patch(`teacher/notification-detial/${teacherId}/${notiId}/`, {seen:true})
            console.log(res.data);
            fetchNoti();
            showToast('success', 'Notification Seen')
        } catch (error) {
            console.log('error', error)
            showToast('error', error.response?.data?.message || 'Something went wrong')
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
                                        <h3 className="mb-0">Notifications</h3>
                                        <span>Manage all your notifications from here</span>
                                    </div>
                                </div>
                                {/* Card body */}
                                <div className="card-body">
                                    {/* List group */}
                                    <ul className="list-group list-group-flush">
                                        {/* List group item */}
                                        {noti?.map((n, index) => (
                                            <li className="list-group-item p-4 shadow rounded-3 mb-3" key={index}>
                                                <div className="d-flex">
                                                    <div className="ms-3 mt-2">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h4 className="mb-0">{n.type}</h4>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <p className="mt-1">
                                                                <span className="me-2 fw-bold">
                                                                    Date: <span className="fw-light">{moment(n.date).format("DD MMM, YYYY")}</span>
                                                                </span>
                                                            </p>
                                                            <p>
                                                                <button class="btn btn-outline-secondary" type="button" onClick={() => handleMarkAsSeen(n.id)}>
                                                                    Mark as Seen <i className="fas fa-check"></i>
                                                                </button>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}

                                        {noti?.length < 1 && <p>No notifications</p>}
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

export default TeacherNotification;
