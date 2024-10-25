import { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [studentData, setStudentData] = useState({ name: '', mobile: '', maths: 0, science: 0, english: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [page, search, sortField, sortOrder]);

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5000/api/students', {
      params: { page, limit, search, sortField, sortOrder }
    });
    setStudents(res.data.students);
  };

  const handleAddStudent = async () => {
    if (isEditing) {
      await axios.put(`http://localhost:5000/api/students/${editingStudentId}`, studentData);
    } else {
      await axios.post('http://localhost:5000/api/students', studentData);
    }
    fetchStudents();
    resetForm();
  };

  const handleDeleteStudent = async (id) => {
    await axios.delete(`http://localhost:5000/api/students/${id}`);
    fetchStudents();
  };

  const handleEditStudent = (student) => {
    setStudentData({
      name: student.name,
      mobile: student.mobile,
      maths: student.maths,
      science: student.science,
      english: student.english,
    });
    setEditingStudentId(student._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setStudentData({ name: '', mobile: '', maths: 0, science: 0, english: 0 });
    setIsEditing(false);
    setEditingStudentId(null);
  };

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container">
      <h1>Student Management System</h1>
      <input
        type="text"
        placeholder="Search Name or Mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        <h2>{isEditing ? 'Edit Student' : 'Add Student'}</h2>
        <input type="text" placeholder="Name" value={studentData.name} onChange={(e) => setStudentData({ ...studentData, name: e.target.value })} />
        <input type="text" placeholder="Mobile" value={studentData.mobile} onChange={(e) => setStudentData({ ...studentData, mobile: e.target.value })} />
        <input type="number" placeholder="Maths" value={studentData.maths} onChange={(e) => setStudentData({ ...studentData, maths: parseInt(e.target.value) })} />
        <input type="number" placeholder="Science" value={studentData.science} onChange={(e) => setStudentData({ ...studentData, science: parseInt(e.target.value) })} />
        <input type="number" placeholder="English" value={studentData.english} onChange={(e) => setStudentData({ ...studentData, english: parseInt(e.target.value) })} />
        <button onClick={handleAddStudent}>{isEditing ? 'Update Student' : 'Add Student'}</button>
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('mobile')}>Mobile</th>
            <th>Maths</th>
            <th>Science</th>
            <th>English</th>
            <th>Total Marks</th>
            <th>Percentage</th>
            <th>Rank</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.mobile}</td>
              <td>{student.maths}</td>
              <td>{student.science}</td>
              <td>{student.english}</td>
              <td>{student.totalMarks}</td>
              <td>{student.percentage}%</td>
              <td>{student.rank}</td>
              <td>
                <button onClick={() => handleEditStudent(student)}>Edit</button>
                <button onClick={() => handleDeleteStudent(student._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
};

export default App;
