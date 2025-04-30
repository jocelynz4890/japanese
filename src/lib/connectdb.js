import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDB() {
  if (isConnected) return; 

  try {
    await mongoose.connect(
      `mongodb+srv://jocelynz4890:${process.env.MONGODB_KEY}@cluster0.bxvvfgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );

    isConnected = true; 
    console.log('Successfully connected to MongoDB');
  } catch (e) {
    console.error('Error connecting to MongoDB:', e); 
  }
}

export default mongoose;
