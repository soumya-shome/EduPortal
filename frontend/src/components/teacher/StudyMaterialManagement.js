import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Download, FileText, Video, Link, Presentation, BookOpen } from 'lucide-react';
import axios from 'axios';

const StudyMaterialManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    material_type: 'document',
    file: null,
    file_url: '',
    week_number: '',
    is_public: false
  });

  const queryClient = useQueryClient();

  // Fetch study materials
  const { data: materials, isLoading } = useQuery('study-materials', async () => {
    const response = await axios.get('/api/study-materials/');
    return response.data;
  });

  // Fetch teacher's courses
  const { data: courses } = useQuery('my-courses', async () => {
    const response = await axios.get('/api/courses/my_courses/');
    return response.data;
  });

  // Create/Update material mutation
  const materialMutation = useMutation(
    async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });

      if (editingMaterial) {
        return axios.put(`/api/study-materials/${editingMaterial.id}/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        return axios.post('/api/study-materials/', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('study-materials');
        toast.success(editingMaterial ? 'Material updated successfully!' : 'Material uploaded successfully!');
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  );

  // Delete material mutation
  const deleteMutation = useMutation(
    async (materialId) => {
      return axios.delete(`/api/study-materials/${materialId}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('study-materials');
        toast.success('Material deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    }
  );

  const filteredMaterials = materials?.filter(material => {
    if (selectedCourse === 'all') return true;
    return material.course === parseInt(selectedCourse);
  });

  const getMaterialTypeIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'link':
        return <Link className="h-5 w-5 text-green-600" />;
      case 'presentation':
        return <Presentation className="h-5 w-5 text-purple-600" />;
      case 'assignment':
        return <BookOpen className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMaterialTypeColor = (type) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'link':
        return 'bg-green-100 text-green-800';
      case 'presentation':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    materialMutation.mutate(formData);
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      course: material.course,
      material_type: material.material_type,
      file: null,
      file_url: material.file_url || '',
      week_number: material.week_number || '',
      is_public: material.is_public
    });
    setIsModalOpen(true);
  };

  const handleDelete = (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      deleteMutation.mutate(materialId);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
    setFormData({
      title: '',
      description: '',
      course: '',
      material_type: 'document',
      file: null,
      file_url: '',
      week_number: '',
      is_public: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate statistics
  const totalMaterials = materials?.length || 0;
  const documents = materials?.filter(m => m.material_type === 'document').length || 0;
  const videos = materials?.filter(m => m.material_type === 'video').length || 0;
  const publicMaterials = materials?.filter(m => m.is_public).length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Study Material Management</h2>
        <div className="flex gap-2">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Upload Material
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Materials</p>
              <p className="text-2xl font-bold text-gray-900">{totalMaterials}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-gray-900">{videos}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Video className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Public Materials</p>
              <p className="text-2xl font-bold text-gray-900">{publicMaterials}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Link className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials?.map((material) => (
          <div key={material.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {getMaterialTypeIcon(material.material_type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{material.title}</h3>
                  <p className="text-sm text-gray-600">{material.course_title}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(material)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMaterialTypeColor(material.material_type)}`}>
                  {material.material_type}
                </span>
              </div>
              {material.week_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Week:</span>
                  <span className="font-medium">{material.week_number}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Visibility:</span>
                <span className={`font-medium ${material.is_public ? 'text-green-600' : 'text-gray-600'}`}>
                  {material.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>Uploaded by {material.uploaded_by_name}</span>
              </div>
              <div className="flex items-center gap-1">
                {material.file && (
                  <a
                    href={material.file_url}
                    download
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Download
                  </a>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {new Date(material.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-500">No study materials match the current filter.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingMaterial ? 'Edit Material' : 'Upload New Material'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses?.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Type
                  </label>
                  <select
                    name="material_type"
                    value={formData.material_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                    <option value="presentation">Presentation</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week Number
                  </label>
                  <input
                    type="number"
                    name="week_number"
                    value={formData.week_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Upload
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.avi,.mov,.jpg,.jpeg,.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File URL (Alternative)
                  </label>
                  <input
                    type="url"
                    name="file_url"
                    value={formData.file_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Make this material public
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={materialMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {materialMutation.isLoading ? 'Uploading...' : (editingMaterial ? 'Update Material' : 'Upload Material')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterialManagement; 