"use server";

import * as XLSX from "xlsx";

export default async function loadLessons() {
    const allLessons = [];

    for (let file = 1; file <= 23; file++) {  
        const baseURL = process.env.NEXTAUTH_URL || "http://localhost:3000"; // TODO: adjust for prod
        const res = await fetch(`${baseURL}/lessons/lesson-${file}.xlsx`);  

        if (!res.ok) {
            console.warn(`Lesson file ${file} not found or inaccessible`);
            continue;
        }
        
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const wordsWithProgress = data.map((word) => ({
        English: word["English"],
        Japanese: word["Japanese"],
        progress: 0,
        })).filter(word => word.English && word.Japanese); // clean empty rows

        allLessons.push({
        lessonNumber: file,
        vocab: wordsWithProgress,
        });

    }

    return allLessons;
}

