import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/lib/connect";
import Student from "@/models/student";
import Teacher from "@/models/teacher";
import { getServerSession } from "next-auth";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      await connectToDB();

      const isTeacher = role === 'teacher';

      const Model = isTeacher ? Teacher : Student;

      const existing = await Model.findOne({ email: user.email });
      if (!existing) {
        await Model.create({
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }

      return true;
    },

    async session({ session }) {
      await connectToDB();

      const teacher = await Teacher.findOne({ email: session.user?.email });
      const student = !teacher && await Student.findOne({ email: session.user?.email });

      const user = teacher || student;

      if (user) {
        (session.user).id = user._id.toString();
        (session.user).role = teacher ? 'teacher' : 'student';
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
