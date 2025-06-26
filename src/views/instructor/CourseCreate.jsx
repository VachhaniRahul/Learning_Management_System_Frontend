import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import Sidebar from "./Partials/Sidebar";
import Header from "./Partials/Header";
import BaseHeader from "../partials/BaseHeader";
import BaseFooter from "../partials/BaseFooter";
import { Link, useNavigate } from "react-router-dom";

import api from "../../utils/axios";
import { showToast } from "../../utils/toast";
import UserData from "../plugin/UserData";
import Spinner from "../../utils/Spinner";

function CourseCreate() {
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        level: "",
        language: "",
        price: "",
        category: "",
        teacher_status: ""
    });

    const [loading, setLoading] = useState(false)

    const [imageFile, setImageFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [videoPreview, setVideoPreview] = useState("");
    const [category, setCategory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await api.get(`course/category/`);
                setCategory(res.data);
                setLoading(false)
            } catch (error) {
                showToast('error', error.response?.data?.message || 'Something went wrong');
            }
        };
        fetchData();
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file)); // preview the selected video
    };



    const handleCourseInputChange = (event) => {
        const { name, value } = event.target;
        setCourseData({ ...courseData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(imageFile)
        const formData = new FormData();
        formData.append("title", courseData.title);
        formData.append("description", courseData.description);
        formData.append("image", imageFile);
        formData.append("file", videoFile);
        formData.append("level", courseData.level);
        formData.append("language", courseData.language);
        formData.append("price", courseData.price);
        formData.append("category", courseData.category);
        formData.append("teacher_status", courseData.teacher_status);
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        try {
            const response = await api.post(`teacher/course-create/${UserData()?.teacher_id}/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            showToast('success', 'Course Created');
            navigate(`/instructor/edit-course/${response?.data?.course_id}/`);
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Something went wrong');
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
                            <form className="col-lg-9 col-md-8 col-12" onSubmit={handleSubmit}>
                                <section className="py-4 py-lg-6 bg-primary rounded-3">
                                    <div className="container">
                                        <div className="row">
                                            <div className="offset-lg-1 col-lg-10 col-md-12 col-12">
                                                <div className="d-lg-flex align-items-center justify-content-between">
                                                    <div className="mb-4 mb-lg-0">
                                                        <h1 className="text-white mb-1">Add New Course</h1>
                                                        <p className="mb-0 text-white lead">Just fill the form and create your courses.</p>
                                                    </div>
                                                    <div>
                                                        <Link to="/instructor/courses/" className="btn" style={{ backgroundColor: "white" }}>
                                                            <i className="fas fa-arrow-left"></i> Back to Course
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="pb-8 mt-5">
                                    <div className="card mb-3">
                                        <div className="card-header border-bottom px-4 py-3">
                                            <h4 className="mb-0">Basic Information</h4>
                                        </div>
                                        <div className="card-body">
                                            <label className="form-label">Thumbnail Preview</label>
                                            <img
                                                style={{ width: "100%", height: "330px", objectFit: "cover", borderRadius: "10px" }}
                                                className="mb-4"
                                                src={imagePreview || "https://www.eclosio.ong/wp-content/uploads/2018/08/default.png"}
                                                alt=""
                                            />

                                            <div className="mb-3">
                                                <label className="form-label">Course Thumbnail</label>
                                                <input className="form-control" type="file" name="image" required onChange={handleImageUpload} />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Intro Video</label>
                                                <input className="form-control" type="file" name="file" required onChange={handleFileUpload} />
                                                {videoPreview && (
                                                    <div className="mt-3">
                                                        <label className="form-label">Video Preview</label>
                                                        <video
                                                            controls
                                                            width="100%"
                                                            height="300px"
                                                            style={{ borderRadius: "10px", objectFit: "cover" }}
                                                            src={videoPreview}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Title</label>
                                                <input className="form-control" type="text" name="title" required onChange={handleCourseInputChange} />
                                                <small>Write a 60 character course title.</small>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Course Category</label>
                                                <select className="form-select" name="category" required onChange={handleCourseInputChange}>
                                                    <option value="">-------------</option>
                                                    {category.map((c, index) => (
                                                        <option key={index} value={c.slug}>
                                                            {c.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Level</label>
                                                <select className="form-select" name="level" required onChange={handleCourseInputChange}>
                                                    <option value="">Select level</option>
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intemediate">Intemediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Language</label>
                                                <select className="form-select" name="language" required onChange={handleCourseInputChange}>
                                                    <option value="">Select Language</option>
                                                    <option value="English">English</option>
                                                    <option value="Spanish">Spanish</option>
                                                    <option value="Hindi">Hindi</option>
                                                    <option value="Gujarati">Gujarati</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <select className="form-select" onChange={handleCourseInputChange} name="language">
                                                    <option value="">Select Language</option>
                                                    <option value="Draft">Draft</option>
                                                    <option value="Disable">Disable</option>
                                                    <option value="Published">Published</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Course Description</label>
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    data=""
                                                    onChange={(event, editor) => {
                                                        setCourseData({
                                                            ...courseData,
                                                            description: editor.getData(),
                                                        });
                                                    }}
                                                    config={{
                                                        toolbar: ["bold", "italic", "link", "bulletedList", "numberedList", "blockQuote", "undo", "redo"],
                                                    }}
                                                />
                                                <small>A brief summary of your course.</small>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Price</label>
                                                <input className="form-control" placeholder="1000 RS" type="number" name="price" required onChange={handleCourseInputChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <button className="btn btn-lg btn-success w-100 mt-2" type="submit">
                                        Create Course <i className="fas fa-check-circle"></i>
                                    </button>
                                </section>
                            </form>
                        </div>
                    </div>
                </section>
            }
            <BaseFooter />
        </>
    );
}

export default CourseCreate;
