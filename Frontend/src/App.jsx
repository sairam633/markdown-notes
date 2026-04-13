import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Toaster, toast } from "react-hot-toast";
import { FaPlus, FaTrash, FaSearch, FaSave, FaThumbtack } from "react-icons/fa";

function App() {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const API = "http://localhost:5000";

  const loadNotes = async () => {
    const res = await axios.get(`${API}/notes`);
    setNotes(res.data);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const createNote = async () => {
    await axios.post(`${API}/notes`, {
      title: "Untitled Note",
      content: "# Start Writing...",
      tags: "",
    });

    toast.success("New note created");
    loadNotes();
  };

  const selectNote = (note) => {
    setSelected(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || "");
  };

  const saveNote = async () => {
    if (!selected) return;

    await axios.put(`${API}/notes/${selected}`, {
      title,
      content,
      tags,
      pinned: 0,
    });

    toast.success("Saved");
    loadNotes();
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/notes/${id}`);
    toast.success("Deleted");
    setSelected(null);
    setTitle("");
    setContent("");
    loadNotes();
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-screen flex bg-slate-950 text-white">
      <Toaster />

      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Markdown Notes</h1>

        <button
          onClick={createNote}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl flex items-center gap-2 mb-4"
        >
          <FaPlus /> New Note
        </button>

        <div className="flex items-center bg-slate-800 rounded-xl px-3 py-2 mb-4">
          <FaSearch />
          <input
            className="bg-transparent outline-none ml-2 w-full"
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto space-y-2">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => selectNote(note)}
              className="bg-slate-900 hover:bg-slate-800 p-3 rounded-xl cursor-pointer"
            >
              <h3 className="font-semibold truncate">{note.title}</h3>
              <p className="text-sm text-slate-400 truncate">{note.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="w-1/2 p-5 flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="bg-slate-900 p-3 rounded-xl text-xl outline-none"
        />

        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags: work, personal"
          className="bg-slate-900 p-3 rounded-xl outline-none"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-slate-900 p-4 rounded-xl flex-1 outline-none resize-none"
        />

        <div className="flex gap-3">
          <button
            onClick={saveNote}
            className="bg-green-600 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <FaSave /> Save
          </button>

          <button
            onClick={() => deleteNote(selected)}
            className="bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="w-1/2 border-l border-slate-800 p-5 overflow-y-auto prose prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;
