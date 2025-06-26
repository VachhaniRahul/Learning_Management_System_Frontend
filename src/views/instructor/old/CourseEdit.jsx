import { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Sidebar from "../Partials/Sidebar";
import BaseHeader from "../../partials/BaseHeader";
import Header from "../Partials/Header";
import BaseFooter from "../../partials/BaseFooter";
import { useParams } from "react-router-dom";
import UserData from "../../plugin/UserData";
import Swal from "sweetalert2";
import api from "../../../utils/axios";
import { showToast } from "../../../utils/toast";
import Spinner from "../../../utils/Spinner";

function CourseEdit() {
    const { course_id } = useParams();
    const teacher_id = UserData()?.teacher_id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState()

    const [basic, setBasic] = useState({
        title: "", description: "", category: "", price: "", level: "", language: "", image: "", file: "", teacher_status: ''
    });
    const [editorData, setEditorData] = useState("");
    const [variants, setVariants] = useState([]);

    const [imagePreview, setImagePreview] = useState("");
    const [loadingImage, setLoadingImage] = useState(false);
    const [update, setUpdate] = useState(false)

    const [editingVariantIndex, setEditingVariantIndex] = useState(null);
    const [editingVariantTitle, setEditingVariantTitle] = useState("");
    const [expandedVariantIndex, setExpandedVariantIndex] = useState(null);

    const [editingItemIndex, setEditingItemIndex] = useState({ variant: null, item: null });
    const [editingItemData, setEditingItemData] = useState({ title: "", description: "", file: null, preview: false });

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const [{ data: catList }, { data: course }] = await Promise.all([
                    api.get("/course/category/"),
                    api.get(`/teacher/course-detail/${course_id}/`)
                ]);
                setCategories(catList);
                setBasic({
                    title: course.title,
                    description: course.description,
                    category: course.category.slug,
                    price: course.price,
                    level: course.level,
                    language: course.language,
                    image: "",
                    file: "",
                    teacher_status: course.teacher_status
                });
                setEditorData(course.description);
                setVariants(course.curriculum.map(v => ({
                    id: v.id,
                    variant_id: v.variant_id,
                    title: v.title,
                    items: v.variant_item.map(i => ({
                        id: i.id,
                        variant_item_id: i.variant_item_id,
                        title: i.title,
                        description: i.description,
                        file: null,
                        preview: i.preview
                    }))
                })));
                setImagePreview(course.image);
                setLoading(false)
            } catch (err) {
                // Toast().fire({ icon: "error", title: "" });
                showToast('error', 'Failed to load course data')
            }
        }
        load();
    }, [course_id]);

    const handleEditor = (_, editor) => {
        setEditorData(editor.getData());
        setBasic(prev => ({ ...prev, description: editor.getData() }));
    };

    const handleBasicChange = e => {
        const { name, value } = e.target;
        setBasic(prev => ({ ...prev, [name]: value }));
    };

    const submitBasic = async () => {
        setUpdate(true)
        try {
            const form = new FormData();
            Object.entries(basic).forEach(([k, v]) => {
                if (v !== "" && v != null) {
                    form.append(k, v);
                }
            });
            await api.patch(`teacher/course-details-update/${teacher_id}/${course_id}/`, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            setUpdate(false)
            Swal.fire({ icon: "success", title: "Course details updated" });
        } catch (error) {
            showToast('error', 'Update failed')
        }
    };

    const handleImageChange = async e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setBasic(prev => ({ ...prev, image: file }));
        };
        reader.readAsDataURL(file);
    };

    const handleIntroVideo = e => {
        setBasic(prev => ({ ...prev, file: e.target.files[0] || "" }));

    };

    const handleEditVariant = (idx) => {
        setEditingVariantIndex(idx);
        setEditingVariantTitle(variants[idx].title);
    };

    const saveVariant = async (idx) => {
        const v = variants[idx];
        try {
            await api.patch(`/teacher/course-variant-delete/${teacher_id}/${course_id}/${v.variant_id}/`, { title: editingVariantTitle });
            setVariants(prev => prev.map((vv, i) => i === idx ? { ...vv, title: editingVariantTitle } : vv));
            setEditingVariantIndex(null);
            showToast('success', 'Section updated')
        } catch {
            showToast('error', 'Failed to update section')
        }
    };

    const deleteVariant = async (idx) => {
        const v = variants[idx];
        try {
            await api.delete(`teacher/course-variant-delete/${teacher_id}/${course_id}/${v.variant_id}/`);
            setVariants(prev => prev.filter((_, i) => i !== idx));
            showToast('success', 'Section deleted')
        } catch {
            showToast('error', 'Failed to delete section')
        }
    };

    const addVariant = async () => {
        try {
            const { data } = await api.post(`teacher/course-variant-create/${teacher_id}/${course_id}/`, { title: "New Section" });
            console.log('DATA', data)
            setVariants(prev => [...prev, { ...data, items: [] }]);
            showToast('success', 'Section added')
        } catch {
            showToast('error', 'Failed to add section')
        }
    };

    const toggleExpand = (idx) => {
        setExpandedVariantIndex(prev => prev === idx ? null : idx);
    };

    const handleEditItem = (vidx, iidx) => {
        const item = variants[vidx].items[iidx];
        setEditingItemIndex({ variant: vidx, item: iidx });
        setEditingItemData({ ...item });
    };

    const saveItem = async (vidx, iidx) => {
        const { title, description, file, preview } = editingItemData;
        const variant_item_id = variants[vidx].items[iidx].variant_item_id;
        try {
            const form = new FormData();
            form.append("title", title);
            form.append("description", description);
            form.append("preview", preview);
            if (file) form.append("file", file);
            await api.patch(`/teacher/course-variant-item-delete/${teacher_id}/${course_id}/${variant_item_id}/`, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            setVariants(prev => prev.map((v, vi) =>
                vi === vidx
                    ? {
                        ...v,
                        items: v.items.map((it, ii) =>
                            ii === iidx ? { ...it, title, description, preview } : it
                        )
                    }
                    : v
            ));
            setEditingItemIndex({ variant: null, item: null });
            showToast('success', 'Lecture Updated')

        } catch {
            showToast('error', 'Failed to update lesson')
        }
    };

    const deleteItem = async (vidx, iidx) => {
        const variant_item_id = variants[vidx].items[iidx].variant_item_id;
        try {
            await api.delete(`/teacher/course-variant-item-delete/${teacher_id}/${course_id}/${variant_item_id}/`);
            setVariants(prev => prev.map((v, i) =>
                i === vidx ? { ...v, items: v.items.filter((_, j) => j !== iidx) } : v
            ));
            showToast('success', 'Lecture Deleted')
        } catch {
            showToast('error', 'Failed to delete lecture')
        }
    };

    const addItem = async (vidx) => {
        const v = variants[vidx];
        try {
            const { data } = await api.post(`/teacher/course-variant-item-create/${teacher_id}/${course_id}/${v.variant_id}/`, { title: "New Lesson" });
            setVariants(prev => prev.map((vv, i) => i === vidx ? { ...vv, items: [...vv.items, data] } : vv));
            showToast('success', 'Lecture Added')

        } catch {
            showToast('error', 'Failed to add Lecture')

        }
    };

    return (
        <>
            <BaseHeader />
            {loading ? <Spinner /> :
                <section className="pt-5 pb-5 bg-light">
                    <div className="container">
                        <Header />
                        <div className="row mt-4">
                            <Sidebar />
                            <div className="col-lg-9 col-md-8 col-12">

                                {/* Basic Course Details */}
                                <div className="card shadow-sm mb-4">
                                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">📝 Basic Course Details</h5>
                                    </div>
                                    <div className="card-body">
                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="mb-3 text-center">
                                                <img src={imagePreview} alt="Preview" className="rounded shadow-sm" style={{ maxHeight: "200px" }} />
                                            </div>
                                        )}

                                        {/* Image and Video Upload */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Course Image</label>
                                                <input type="file" name="image" className="form-control" onChange={handleImageChange} disabled={loadingImage} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Intro Video</label>
                                                <input type="file" name="file" className="form-control" onChange={handleIntroVideo} />
                                            </div>
                                        </div>

                                        {/* Basic Info */}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Title</label>
                                                <input type="text" name="title" value={basic.title} onChange={handleBasicChange} className="form-control" placeholder="Course Title" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Price (₹)</label>
                                                <input type="number" name="price" value={basic.price} onChange={handleBasicChange} className="form-control" placeholder="e.g. 999" />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Category</label>
                                                <select name="category" value={basic.category} onChange={handleBasicChange} className="form-select">
                                                    <option value="">Choose...</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.slug}>{c.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Level</label>
                                                <select name="level" value={basic.level} onChange={handleBasicChange} className="form-select">
                                                    <option value="">Choose...</option>
                                                    <option>Beginner</option>
                                                    <option>Intermediate</option>
                                                    <option>Advanced</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Language</label>
                                                <select name="language" value={basic.language} onChange={handleBasicChange} className="form-select">
                                                    <option value="">Choose...</option>
                                                    <option>English</option>
                                                    <option>Spanish</option>
                                                    <option>Hindi</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Status and Description */}
                                        <div className="mb-3">
                                            <label className="form-label">Teacher Status</label>
                                            <select name="teacher_status" value={basic.teacher_status} onChange={handleBasicChange} className="form-select">
                                                <option value="">Choose...</option>
                                                <option>Draft</option>
                                                <option>Disable</option>
                                                <option>Published</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <CKEditor editor={ClassicEditor} data={editorData} onChange={handleEditor} />
                                        </div>

                                        <div className="text-end">
                                            {update ? <button disabled="true" className="btn btn-success px-4">
                                                💾 Updating Details ...
                                            </button> :
                                            <button onClick={submitBasic} className="btn btn-success px-4">
                                                💾 Update Details
                                            </button>}
                                        </div>
                                    </div>
                                </div>

                                {/* Course Sections (Variants) */}
                                <div className="card shadow-sm mb-4">
                                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">📚 Course Sections</h5>
                                        <button className="btn btn-sm btn-light" onClick={addVariant}>+ Add Section</button>
                                    </div>
                                    <div className="card-body">
                                        {variants.map((v, idx) => (
                                            <div className="card mb-3 shadow-sm" key={idx}>
                                                <div className="card-body">
                                                    {editingVariantIndex === idx ? (
                                                        <div className="d-flex gap-2 mb-2">
                                                            <input value={editingVariantTitle} onChange={e => setEditingVariantTitle(e.target.value)} className="form-control" />
                                                            <button className="btn btn-success btn-sm" onClick={() => saveVariant(idx)}>Save</button>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingVariantIndex(null)}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h6>{v.title}</h6>
                                                            <div>
                                                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditVariant(idx)}>Edit</button>
                                                                <button className="btn btn-sm btn-outline-danger me-2" onClick={() => deleteVariant(idx)}>Delete</button>
                                                                <button className="btn btn-sm btn-outline-dark" onClick={() => toggleExpand(idx)}>
                                                                    {expandedVariantIndex === idx ? "Hide Lessons" : "Show Lessons"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {expandedVariantIndex === idx && (
                                                        <div className="mt-3">
                                                            {v.items.map((it, iidx) => (
                                                                <div key={iidx} className="border rounded p-3 mb-2 bg-light">
                                                                    {editingItemIndex.variant === idx && editingItemIndex.item === iidx ? (
                                                                        <>
                                                                            <input value={editingItemData.title} onChange={e => setEditingItemData(d => ({ ...d, title: e.target.value }))} className="form-control mb-1" placeholder="Lecture Title" />
                                                                            <textarea value={editingItemData.description} onChange={e => setEditingItemData(d => ({ ...d, description: e.target.value }))} className="form-control mb-1" placeholder="Lecture Description" />
                                                                            <input type="file" onChange={e => setEditingItemData(d => ({ ...d, file: e.target.files[0] }))} className="form-control mb-1" />
                                                                            <div className="form-check">
                                                                                <input type="checkbox" className="form-check-input" id={`preview-${idx}-${iidx}`} checked={editingItemData.preview} onChange={e => setEditingItemData(d => ({ ...d, preview: e.target.checked }))} />
                                                                                <label className="form-check-label" htmlFor={`preview-${idx}-${iidx}`}>Preview</label>
                                                                            </div>
                                                                            <div className="mt-2 d-flex gap-2">
                                                                                <button className="btn btn-success btn-sm" onClick={() => saveItem(idx, iidx)}>Save</button>
                                                                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingItemIndex({ variant: null, item: null })}>Cancel</button>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <h6 className="mb-1">{it.title}</h6>
                                                                            <p className="mb-1">{it.description}</p>
                                                                            <p className="mb-1">Preview: <span className="badge bg-info text-dark">{it.preview ? "Yes" : "No"}</span></p>
                                                                            <div className="d-flex gap-2">
                                                                                <button className="btn btn-outline-primary btn-sm" onClick={() => handleEditItem(idx, iidx)}>Edit</button>
                                                                                <button className="btn btn-outline-danger btn-sm" onClick={() => deleteItem(idx, iidx)}>Delete</button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <button className="btn btn-sm btn-secondary mt-2" onClick={() => addItem(idx)}>+ Add Lecture</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
            <BaseFooter />

        </>
    );
}

export default CourseEdit;

