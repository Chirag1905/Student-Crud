const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/students');

// Schema for Student
const studentSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  maths: Number,
  science: Number,
  english: Number,
  totalMarks: Number,
  percentage: Number,
  rank: Number
});

const Student = mongoose.model('Student', studentSchema);

// Add Student
app.post('/api/students', async (req, res) => {
  const { name, mobile, maths, science, english } = req.body;
  const totalMarks = maths + science + english;
  const percentage = (totalMarks / 300) * 100;

  const student = new Student({ name, mobile, maths, science, english, totalMarks, percentage });
  await student.save();
  res.json(student);
});

// Get Students (with Pagination, Sorting, and Search)
app.get('/api/students', async (req, res) => {
  const { page = 1, limit = 10, search = '', sortField = 'name', sortOrder = 'asc' } = req.query;

  const searchQuery = {
    $or: [
      { name: new RegExp(search, 'i') },
      { mobile: new RegExp(search, 'i') }
    ]
  };

  const students = await Student.find(searchQuery)
    .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalStudents = await Student.countDocuments(searchQuery);
  
  res.json({ students, totalStudents });
});

// Edit Student
app.put('/api/students/:id', async (req, res) => {
  const { name, mobile, maths, science, english } = req.body;
  const totalMarks = maths + science + english;
  const percentage = (totalMarks / 300) * 100;

  const student = await Student.findByIdAndUpdate(req.params.id, { name, mobile, maths, science, english, totalMarks, percentage }, { new: true });
  res.json(student);
});

// Delete Student
app.delete('/api/students/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Student deleted' });
});

// Rank Calculation
app.get('/api/rank', async (req, res) => {
  const students = await Student.find().sort({ totalMarks: -1 });
  let rank = 1;
  let previousMarks = -1;
  students.forEach((student, index) => {
    if (student.totalMarks !== previousMarks) {
      rank = index + 1;
    }
    student.rank = rank;
    previousMarks = student.totalMarks;
    student.save();  // Update the rank in DB
  });
  res.json(students);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
