import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Student from "@/models/student";
import { connectToDB } from "@/lib/connectdb";

export async function GET() {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const student = await Student.findOne({ email: session.user.email });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ lessons: student.lessons });
  } catch (err) {
    console.error("Failed to fetch student lessons:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}



// not using this

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const fileName = searchParams.get('file') || 'lesson-1.xlsx'; 
//   const filePath = path.join(process.cwd(), 'public/lessons', fileName);

//   if (!fs.existsSync(filePath)) {
//     return NextResponse.json({ error: 'Lesson file not found' }, { status: 404 });
//   }

//   const file = fs.readFileSync(filePath);
//   const workbook = XLSX.read(file, { type: 'buffer' });
//   const sheetName = workbook.SheetNames[0];
//   const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   return NextResponse.json({ data });
// }
