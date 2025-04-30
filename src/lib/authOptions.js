import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/lib/connectdb";
import Student from "@/models/student";
import Teacher from "@/models/teacher";
import { cookies } from "next/headers"; 
import loadLessons from "@/lib/loadLessons";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await connectToDB();

        const cookieStore = await cookies();
        const role = await cookieStore.get("login_role")?.value ?? null;

        if (!role || !["student", "teacher"].includes(role)) {
          console.warn("❌ Invalid or missing role.");
          return false;
        }

        const Model = role === "teacher" ? Teacher : Student;
        const existingUser = await Model.findOne({ email: user.email });

        const lessonList = await loadLessons();
        // console.log(lessonList);

        if (!existingUser) {
          await Model.create({
            email: user.email,
            lessons: lessonList,
          });
        }

        return true;
      } catch (error) {
        console.error("❌ signIn error:", error);
        return false;
      }
    },

    async session({ session }) {
      try {
        await connectToDB();

        const cookieStore = await cookies();
        const role = await cookieStore.get("login_role")?.value;

        const Model = role === "teacher" ? Teacher : Student;
        const user = await Model.findOne({ email: session.user.email });

        if (user) {
          session.user.id = user._id.toString();
          session.user.role = role;
        }

        return session;
      } catch (error) {
        console.error("❌ session error:", error);
        return session;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
