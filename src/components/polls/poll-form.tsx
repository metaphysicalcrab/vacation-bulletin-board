"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export function PollForm({
  onSubmit,
}: {
  onSubmit: (question: string, options: string[]) => void;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  function handleAddOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function handleRemoveOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return;
    onSubmit(question.trim(), validOptions);
    setQuestion("");
    setOptions(["", ""]);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-border bg-surface p-4"
    >
      <div className="mb-3">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask?"
          autoFocus
          maxLength={200}
        />
      </div>
      <div className="mb-3 space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
              placeholder={`Option ${i + 1}`}
              maxLength={100}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(i)}
                className="text-foreground-tertiary hover:text-foreground-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="text-sm text-accent hover:underline"
          >
            + Add option
          </button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={
            !question.trim() ||
            options.filter((o) => o.trim()).length < 2
          }
        >
          Create Poll
        </Button>
      </div>
    </form>
  );
}
