export default function Lessons(){
    // TODO: parse lessons vocab, add grammar
    let lessons = new Array(30).fill(null);

    // TODO: add dropdowns, progress
    return (
        <div className="flex flex-col border-r border-white w-1/3 h-full overflow-y-auto">
            <hr></hr>
            {lessons.map((_, i) => (
                <div key={i} className="p-4 shadow-md border-b border-gray border-opacity-50">
                    <h2 className="text-xl font-bold p-4 m-2 self-center">Lesson {i + 1}</h2>
                </div>
            ))}
        </div>
    )
}