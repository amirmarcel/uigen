"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TitleDescriptionCard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setSubmitted(false);
  };

  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50 mx-4 mt-4">
      {submitted ? (
        <div className="space-y-1">
          <h2 className="font-semibold text-neutral-900 text-sm">{title}</h2>
          <p className="text-neutral-500 text-sm">{description}</p>
          <Button variant="link" className="p-0 h-auto text-xs" onClick={handleReset}>
            Edit
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="card-title" className="text-xs font-medium text-neutral-700">Title</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="card-description" className="text-xs font-medium text-neutral-700">Description</Label>
            <Input
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
              className="h-8 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="w-full h-8 text-xs">
            Save
          </Button>
        </form>
      )}
    </div>
  );
}
