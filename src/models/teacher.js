import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  classes: [{ type: String }] // class code strings
  });

// avoid redefining the model during hot reload
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);

export default Teacher;