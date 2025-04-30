import mongoose from "@/lib/connectdb";

const TeacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
});

// avoid redefining the model during hot reload
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);

export default Teacher;