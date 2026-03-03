"use client"

import { useState } from "react"
import { Plus, Trash2, RotateCcw, Pencil, Check, GripVertical } from "lucide-react"
import ScoreSlider from "@/components/ui/ScoreSlider"
import type { SkillItem } from "@/types"

interface SkillsEditorProps {
  title: string
  skills: SkillItem[]
  onScoreChange: (index: number, score: number) => void
  onUpdateSkill: (index: number, field: "label" | "description", value: string) => void
  onAddSkill: () => void
  onRemoveSkill: (index: number) => void
  onReset: () => void
}

export default function SkillsEditor({
  title,
  skills,
  onScoreChange,
  onUpdateSkill,
  onAddSkill,
  onRemoveSkill,
  onReset,
}: SkillsEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  return (
    <section>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-lg font-semibold text-text-primary">{title}</h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-base-700 hover:text-text-secondary"
          title="Restablecer habilidades por defecto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer
        </button>
      </div>

      <div className="rounded-xl border border-base-600 bg-base-800 shadow-card">
        <div className="divide-y divide-base-700">
          {skills.map((skill, index) => (
            <div key={index} className="group p-4">
              {/* Skill header: editable label / description or static */}
              {editingIndex === index ? (
                /* ─── Edit mode ─── */
                <div className="mb-3 flex items-start gap-2">
                  <GripVertical className="mt-1 h-4 w-4 shrink-0 text-base-600" />
                  <div className="flex-1 space-y-2">
                    <input
                      autoFocus
                      value={skill.label}
                      onChange={(e) => onUpdateSkill(index, "label", e.target.value)}
                      placeholder="Nombre de la habilidad"
                      className="w-full rounded-lg border border-electric/50 bg-base-700 px-3 py-1.5 text-sm font-medium text-text-primary outline-none focus:border-electric focus:ring-1 focus:ring-electric"
                    />
                    <input
                      value={skill.description}
                      onChange={(e) => onUpdateSkill(index, "description", e.target.value)}
                      placeholder="Descripción breve (opcional)"
                      className="w-full rounded-lg border border-base-600 bg-base-700 px-3 py-1.5 text-xs text-text-secondary outline-none focus:border-electric focus:ring-1 focus:ring-electric"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="rounded-lg bg-electric/10 p-1.5 text-electric transition-colors hover:bg-electric/20"
                      title="Confirmar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { onRemoveSkill(index); setEditingIndex(null) }}
                      disabled={skills.length <= 1}
                      className="rounded-lg bg-danger-500/10 p-1.5 text-danger-400 transition-colors hover:bg-danger-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Eliminar habilidad"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── View mode ─── */
                <div className="mb-3 flex items-start gap-2">
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-base-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">{skill.label || "Sin nombre"}</span>
                    {skill.description && (
                      <p className="text-xs text-text-tertiary">{skill.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(index)}
                    className="shrink-0 rounded-lg p-1.5 text-text-tertiary opacity-0 transition-all hover:bg-base-700 hover:text-text-secondary group-hover:opacity-100"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Score slider */}
              <div className="pl-6">
                <ScoreSlider
                  name={`skill-${index}`}
                  label=""
                  description=""
                  value={skill.score}
                  onChange={(v) => onScoreChange(index, v)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add skill button */}
        <div className="border-t border-base-700 p-3">
          <button
            type="button"
            onClick={() => {
              onAddSkill()
              // Auto-edit the newly added skill
              setTimeout(() => setEditingIndex(skills.length), 0)
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-base-600 px-4 py-2.5 text-sm font-medium text-text-tertiary transition-colors hover:border-electric/50 hover:bg-electric/5 hover:text-electric"
          >
            <Plus className="h-4 w-4" />
            Agregar habilidad
          </button>
        </div>
      </div>
    </section>
  )
}
