export function formatLessonsForLLM(lessons) {
    // TODO: remove restriction to lesson 1
    return lessons
    .map((lesson) => {
        if (lesson.lessonNumber === 1){
            const vocabList = lesson.vocab
            .map(
            (word, idx) =>
                `${idx + 1}. English: "${word.English}", Japanese: "${word.Japanese}", Progress: ${word.progress}%`
            )
            .join("\n");

            return `Lesson ${lesson.lessonNumber}:\n${vocabList}`;
        }
    })
    .join("\n\n");
//     return lessons
//       .map((lesson) => {
//         const vocabList = lesson.vocab
//           .map(
//             (word, idx) =>
//               `${idx + 1}. English: "${word.English}", Japanese: "${word.Japanese}", Progress: ${word.progress}%`
//           )
//           .join("\n");
  
//         return `Lesson ${lesson.lessonNumber}:\n${vocabList}`;
//       })
//       .join("\n\n");
}
  