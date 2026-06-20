import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/UI/Table";
import UserHistoryModal from "../../components/UserHistoryModal";
import { History } from "lucide-react";

const MenteeList = () => {
  const [mentees] = useState([
    {
      _id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "+1234567890",
      interests: "Web Development, React",
      goals: "Become a full-stack developer",
      createdAt: "2024-01-20",
    },
    {
      _id: "2",
      name: "Bob Williams",
      email: "bob@example.com",
      phone: "+1234567891",
      interests: "Data Science, Python",
      goals: "Build ML models",
      createdAt: "2024-02-05",
    },
    {
      _id: "3",
      name: "Carol Martinez",
      email: "carol@example.com",
      phone: "+1234567892",
      interests: "Mobile Development, Flutter",
      goals: "Create mobile apps",
      createdAt: "2024-02-25",
    },
    {
      _id: "4",
      name: "Daniel Lee",
      email: "daniel@example.com",
      phone: "+1234567893",
      interests: "UI/UX Design",
      goals: "Design user-friendly interfaces",
      createdAt: "2024-03-10",
    },
    {
      _id: "5",
      name: "Eva Garcia",
      email: "eva@example.com",
      phone: "+1234567894",
      interests: "Cloud Computing, AWS",
      goals: "Get AWS certification",
      createdAt: "2024-04-15",
    },
  ]);
  const [historyUser, setHistoryUser] = useState(null);
  const navigate = useNavigate();

  const columns = [
    {
      key: "image",
      title: "Image",
      render: (mentee) => (
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {mentee.name.charAt(0)}
        </div>
      ),
    },
    {
      key: "name",
      title: "Name",
      render: (mentee) => <span className="font-medium">{mentee.name}</span>,
    },
    {
      key: "email",
      title: "Email",
      render: (mentee) => <span>{mentee.email}</span>,
    },
    {
      key: "phone",
      title: "Phone",
      render: (mentee) => <span>{mentee.phone}</span>,
    },
    {
      key: "interests",
      title: "Interests",
      render: (mentee) => (
        <span className="max-w-xs truncate">{mentee.interests}</span>
      ),
    },
    {
      key: "goals",
      title: "Goals",
      render: (mentee) => (
        <span className="max-w-xs truncate">{mentee.goals}</span>
      ),
    },
    {
      key: "createdAt",
      title: "Created At",
      render: (mentee) => mentee.createdAt,
    },
  ];

  const handleView = (mentee) => {
    console.log("View mentee:", mentee);
  };

  const handleHistory = (mentee) => {
    setHistoryUser(mentee);
  };

  const handleEdit = (mentee) => {
    console.log("Edit mentee:", mentee);
  };

  const handleDelete = (mentee) => {
    if (window.confirm(`Are you sure you want to delete ${mentee.name}?`)) {
      console.log("Delete mentee:", mentee);
    }
  };

  const handleAddNew = () => {
    navigate("/mentee/add");
  };

  return (
    <div className="p-4">
      <Table
        title="Mentee Management"
        addButtonText="Add New Mentee"
        columns={columns}
        data={mentees}
        onAddNew={handleAddNew}
        onView={handleView}
        onHistory={handleHistory}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={false}
      />
      <div className="mt-4 text-sm text-gray-600">
        Showing {mentees.length} mentees
      </div>

      {historyUser && (
        <UserHistoryModal
          user={historyUser}
          onClose={() => setHistoryUser(null)}
        />
      )}
    </div>
  );
};

export default MenteeList;
