import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, 
    classCode: { type: String, default: null },
    lessons: [
      [
        { item: String, progress: Number}
      ]
    ],
    progressionOverTime: [ { timestamp: String, update: Number} ]
});

// avoid redefining the model during hot reload
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

export default Student;