import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";

const MentorList = () => {
  const [mentors] = useState([
    {
      _id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "+1234567890",
      expertise: "Web Development, React, Node.js",
      experience: "5 years",
      createdAt: "2024-01-15",
    },
    {
      _id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1234567891",
      expertise: "Data Science, Machine Learning",
      experience: "7 years",
      createdAt: "2024-02-10",
    },
    {
      _id: "3",
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "+1234567892",
      expertise: "Mobile Development, Flutter",
      experience: "3 years",
      createdAt: "2024-03-05",
    },
    {
      _id: "4",
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+1234567893",
      expertise: "UI/UX Design, Figma",
      experience: "4 years",
      createdAt: "2024-03-20",
    },
    {
      _id: "5",
      name: "David Wilson",
      email: "david@example.com",
      phone: "+1234567894",
      expertise: "Python, Django, AI",
      experience: "6 years",
      createdAt: "2024-04-01",
    },
  ]);
  const navigate = useNavigate();

  const columns = [
    {
      key: "image",
      title: "Image",
      render: (mentor) => (
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {mentor.name.charAt(0)}
        </div>
      ),
    },
    {
      key: "name",
      title: "Name",
      render: (mentor) => <span className="font-medium">{mentor.name}</span>,
    },
    {
      key: "email",
      title: "Email",
      render: (mentor) => (
        <span className="block max-w-[180px] truncate" title={mentor.email}>
          {mentor.email}
        </span>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (mentor) => <span>{mentor.phone}</span>,
    },
    {
      key: "expertise",
      title: "Expertise",
      render: (mentor) => (
        <span className="max-w-xs truncate">{mentor.expertise}</span>
      ),
    },
    {
      key: "experience",
      title: "Experience",
      render: (mentor) => <span>{mentor.experience}</span>,
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (mentor) => mentor.createdAt,
    },
  ];

  const handleView = (mentor) => {
    console.log("View mentor:", mentor);
  };

  const handleEdit = (mentor) => {
    console.log("Edit mentor:", mentor);
  };

  const handleDelete = (mentor) => {
    if (window.confirm(`Are you sure you want to delete ${mentor.name}?`)) {
      console.log("Delete mentor:", mentor);
    }
  };

  const handleAddNew = () => {
    navigate("/mentor/add");
  };

  return (
    <div className="p-4">
      <Table
        title="Mentor Management"
        addButtonText="Add New Mentor"
        columns={columns}
        data={mentors}
        onAddNew={handleAddNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={false}
      />
      <div className="mt-4 text-sm text-gray-600">
        Showing {mentors.length} mentors
      </div>
    </div>
  );
};

export default MentorList;
