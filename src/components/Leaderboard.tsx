import React, { useMemo, useState } from "react";

export type LeaderboardEntry = {
  name: string;
  minutes: number;
  updatedAt: number;
};

type Props = {
  entries: LeaderboardEntry[];
  selectedName: string;
  onSelectName: (name: string) => void;
  onAddName: (name: string) => void;
};

const Leaderboard: React.FC<Props> = ({
  entries,
  selectedName,
  onSelectName,
  onAddName,
}) => {
  const [newName, setNewName] = useState("");

  const allNames = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => set.add(e.name));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [entries]);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (b.minutes !== a.minutes) return b.minutes - a.minutes;
      return b.updatedAt - a.updatedAt;
    });
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-5">
        <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
          لوحة الصدارة
        </div>

        <div className="mt-4 grid gap-3">
          <div className="grid gap-2">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              اختر اسمك
            </div>

            <select
              value={selectedName}
              onChange={e => onSelectName(e.target.value)}
              className="w-full rounded-xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
              dir="rtl"
            >
              <option value="" disabled>
                اختر اسمك
              </option>

              {allNames.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {allNames.length === 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                لا يوجد أسماء بعد. أضف اسمك.
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              أضف اسمك
            </div>

            <div className="flex gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="اكتب اسمك"
                className="flex-1 rounded-xl p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                dir="rtl"
              />
              <button
                onClick={() => {
                  const n = newName.trim();
                  if (!n) return;

                  onAddName(n);
                  onSelectName(n);

                  setNewName("");
                }}
                className="rounded-xl px-4 bg-cyan-600 text-white hover:bg-cyan-500"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-5">
        <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
          الترتيب
        </div>

        <div className="mt-4 space-y-3">
          {sorted.length === 0 && (
            <div className="text-zinc-600 dark:text-zinc-300">
              لا يوجد بيانات بعد
            </div>
          )}

          {sorted.map((e, idx) => (
            <div
              key={e.name}
              className="flex items-center justify-between rounded-xl p-3 bg-white/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center font-bold text-zinc-700 dark:text-zinc-200">
                  {idx + 1}
                </div>
                <div
                  className="font-semibold text-zinc-800 dark:text-zinc-100"
                  dir="rtl"
                >
                  {e.name}
                </div>
              </div>

              <div className="font-bold text-cyan-700 dark:text-cyan-300">
                {e.minutes} دقيقة
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
