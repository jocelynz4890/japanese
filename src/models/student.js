import mongoose from "@/lib/connectdb";

const StudentSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, 
    classCode: { type: String, default: null },
    lessons: [
        {
            lessonNumber: Number,
            vocab: [{
                English: String,
                Japanese: String,
                progress: Number
            }]
        }
    ],
    progressionOverTime: [ { timestamp: String, update: Number} ],
    chat: [ {name: String, messages: [
        {
            role: { type: String, required: true }, // 'user' or 'assistant'
            content: { type: String, required: true }, // message content
            refusal: { type: mongoose.Schema.Types.Mixed, default: null },
            annotations: { type: [mongoose.Schema.Types.Mixed], default: [] }
        }
    ], lastUpdate: String} ]
});

// avoid redefining the model during hot reload
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

export default Student;