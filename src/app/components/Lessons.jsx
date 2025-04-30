"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
        const res = await fetch("/api/lessons");
        const data = await res.json();
        if (res.ok) {
            setLessons(data.lessons);
        } else {
            console.error("Error fetching lessons:", data.error);
        }

        // const allLessons = [];
    
        // for (let file = 1; file <= 23; file++) {  
        //     const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000"; // TODO: adjust for prod
        //     const res = await fetch(`${baseURL}/lessons/lesson-${file}.xlsx`);  
    
        //     if (!res.ok) {
        //         console.warn(`Lesson file ${file} not found or inaccessible`);
        //         continue;
        //     }
            
        //     const arrayBuffer = await res.arrayBuffer();
        //     const workbook = XLSX.read(arrayBuffer, { type: "array" });
        //     const sheetName = workbook.SheetNames[0];
        //     const sheet = workbook.Sheets[sheetName];
        //     const data = XLSX.utils.sheet_to_json(sheet);
    
        //     const wordsWithProgress = data.map((word) => ({
        //     ...word,
        //     progress: 0,
        //     }));
    
        //     allLessons.push({
        //     lessonNumber: file,
        //     vocab: wordsWithProgress
        //     });
        // }
    
        // setLessons(allLessons);
    };
    fetchLessons();
  }, []);

  function toggleLesson(n) {
    setSelectedLesson((prev) => (prev === n ? null : n));
  }

  return (
    <div
      style={{ borderColor: "var(--foreground)" }}
      className="flex flex-col border-r w-1/2 h-full overflow-y-auto"
    >
        {/* <p>{ JSON.stringify(lessons[0]?.vocab, null, 2) }</p> */}

        <hr />

        {/* List of lessons */}
        {lessons.map((lesson, idx) => (
            <div
            key={lesson.lessonNumber ? `lesson-${lesson.lessonNumber}` : `lesson-${idx}`}
            onClick={() => toggleLesson(lesson.lessonNumber)}
            className="p-4 shadow-md border-b border-gray border-opacity-50 cursor-pointer hover:bg-gray-900"
            >
            <h2 className="text-xl font-bold p-4 m-2 self-center">
                Lesson {lesson.lessonNumber ?? idx + 1}
            </h2>

            {selectedLesson === lesson.lessonNumber && (
                <div className="p-4">
                {lesson.vocab?.map((word, wordIdx) => (
                    <div
                    key={`word-${word.English}-${word.Japanese}-${wordIdx}`}
                    className="p-4 border-b"
                    >
                    <h4 className="text-md font-semibold">
                        {word.English} - {word.Japanese}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${word.progress}%` }}
                        ></div>
                        </div>
                        <span className="text-sm ml-2">{word.progress}%</span>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        ))}
        </div>
    );
}
