export function formatLessonsForLLM(lessons) {
    return lessons
      .map((lesson) => {
        const vocabList = lesson.vocab
          .map(
            (word, idx) =>
              `${idx + 1}. English: "${word.English}", Japanese: "${word.Japanese}", Progress: ${word.progress}%`
          )
          .join("\n");
  
        return `Lesson ${lesson.lessonNumber}:\n${vocabList}`;
      })
      .join("\n\n");
  }
  