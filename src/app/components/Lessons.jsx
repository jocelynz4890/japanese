"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function Lessons() {
    const [lessons, setLessons] = useState([]);        
    const [selectedLesson, setSelectedLesson] = useState(null); 

    useEffect(() => {
        async function loadLessons() {
        const allLessons = [];

        for (let file = 1; file <= 23; file++) {  
            const res = await fetch(`/lessons/lesson-${file}.xlsx`);
            const arrayBuffer = await res.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            const wordsWithProgress = data.map((word) => ({
            ...word,
            progress: 0,
            }));

            allLessons.push({
            lessonNumber: file,
            vocab: wordsWithProgress
            });
        }

        setLessons(allLessons);
        }

        loadLessons();
    }, []);

    function toggleLesson(n) {
        if (selectedLesson===n) {
            setSelectedLesson(null);
        }
        else {
            setSelectedLesson(n);
        }
    }

    return (
        <div className="flex flex-col border-r border-white w-1/2 h-full overflow-y-auto">
        <hr />

        {/* List of lessons */}
        {lessons.map((lesson) => (
            <div 
            key={lesson.lessonNumber} 
            onClick={() => toggleLesson(lesson.lessonNumber)} 
            className="p-4 shadow-md border-b border-gray border-opacity-50 cursor-pointer hover:bg-gray-900"
            >
            <h2 className="text-xl font-bold p-4 m-2 self-center">
                Lesson {lesson.lessonNumber}
            </h2>
            {/* selected lesson */}
            {selectedLesson===lesson.lessonNumber && (
                <div className="p-4">
                    {lessons.find(l => l.lessonNumber === selectedLesson)?.vocab.map((word, idx) => (
                        <div key={idx} className="p-4 border-b">
                        <h4 className="text-md font-semibold">{word.English} - {word.Japanese}</h4>
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