"use client";

import { useState, useTransition, useRef } from "react";
import { Sparkles } from "lucide-react";
import {
  createAnnouncementAction,
  draftAnnouncementAction,
} from "@/app/(dashboard)/communication/announcements/actions";

export function NewAnnouncementForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [audience, setAudience] = useState("ALL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDrafting, startDrafting] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAnnouncementAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setAudience("ALL");
      setTitle("");
      setDescription("");
      setTopic("");
    });
  }

  function handleDraft() {
    setAiError(null);
    startDrafting(async () => {
      const result = await draftAnnouncementAction(topic);
      if ("error" in result) {
        setAiError(result.error);
        return;
      }
      setTitle(result.title);
      setDescription(result.description);
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold text-slate-800">New Announcement</h2>

      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Optional: describe the topic and let AI draft it, e.g. 'library closed Thursday for stocktaking'"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="button"
          onClick={handleDraft}
          disabled={isDrafting || !topic.trim()}
          className="flex items-center gap-1.5 text-xs font-medium bg-violet-50 hover:bg-violet-100 disabled:opacity-50 text-violet-700 rounded-lg px-3 py-2 whitespace-nowrap"
        >
          <Sparkles size={14} />
          {isDrafting ? "Drafting..." : "Draft with AI"}
        </button>
      </div>
      {aiError && <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2">{aiError}</p>}

      <input
        name="title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      <textarea
        name="description"
        required
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <select
          name="audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="ALL">Entire school</option>
          <option value="STAFF">Staff only</option>
          <option value="PARENTS">Parents only</option>
          <option value="TEACHERS">Teachers only</option>
          <option value="CLASS">Specific class</option>
        </select>
        {audience === "CLASS" && (
          <select
            name="classId"
            required
            defaultValue=""
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="" disabled>
              Select class
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="publishNow" defaultChecked className="rounded border-slate-300" />
        Publish immediately (notifies the target audience)
      </label>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Saving..." : "Create Announcement"}
      </button>
    </form>
  );
}
