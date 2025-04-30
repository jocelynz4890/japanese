import mongoose from "@/lib/connectdb";

const ClassSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }
});
  
const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
export default Class;
  