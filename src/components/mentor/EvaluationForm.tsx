"use client"

import { useEvaluation } from "@/hooks/useEvaluation"
import SkillsEditor from "@/components/mentor/SkillsEditor"
import Textarea from "@/components/ui/Textarea"
import Button from "@/components/ui/Button"
import ScoreBreakdown from "@/components/mentor/ScoreBreakdown"
import { toast } from "sonner"
import { useEffect } from "react"
import { Save } from "lucide-react"

interface EvaluationFormProps {
  internId: string
  weekNumber: number
  onSubmit: (formData: Record<string, unknown>) => Promise<void>
  submitting: boolean
}

export default function EvaluationForm({ internId, weekNumber, onSubmit, submitting }: EvaluationFormProps) {
  const evaluation = useEvaluation()
  const {
    techSkills, softSkills,
    setTechScore, setSoftScore,
    updateTechSkill, updateSoftSkill,
    addTechSkill, removeTechSkill,
    addSoftSkill, removeSoftSkill,
    resetTechSkills, resetSoftSkills,
  } = evaluation

  // Sync internId and weekNumber into the store
  const { internId: currentInternId, setIntern, weekNumber: currentWeek, setWeek } = evaluation
  useEffect(() => {
    if (currentInternId !== internId) setIntern(internId)
  }, [internId, currentInternId, setIntern])
  useEffect(() => {
    if (currentWeek !== weekNumber) setWeek(weekNumber)
  }, [weekNumber, currentWeek, setWeek])

  const handleSubmit = async () => {
    if (!evaluation.isComplete) {
      // Provide detailed feedback about which fields are missing to aid debugging
      const missing: string[] = []
      if (!evaluation.internId) missing.push("Practicante no seleccionado")
      if (!evaluation.weekNumber) missing.push("Semana no seleccionada")
      if ((evaluation.strengths ?? "").trim().length < 10) missing.push("Fortalezas: mínimo 10 caracteres")
      if ((evaluation.improvements ?? "").trim().length < 10) missing.push("Áreas de mejora: mínimo 10 caracteres")
      if ((evaluation.goals ?? "").trim().length < 10) missing.push("Objetivos: mínimo 10 caracteres")

      if (missing.length) {
        missing.forEach((m) => toast.error(m))
      } else {
        toast.error("Completa todos los campos requeridos")
      }
      return
    }

    try {
      await onSubmit({ ...evaluation.formData })
    } catch {
      toast.error("Error al guardar la evaluación")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-8">
        {/* Section 1: Technical Skills */}
        <SkillsEditor
          title="Habilidades Técnicas"
          skills={techSkills}
          onScoreChange={setTechScore}
          onUpdateSkill={updateTechSkill}
          onAddSkill={addTechSkill}
          onRemoveSkill={removeTechSkill}
          onReset={resetTechSkills}
        />

        {/* Section 2: Soft Skills */}
        <SkillsEditor
          title="Habilidades Blandas"
          skills={softSkills}
          onScoreChange={setSoftScore}
          onUpdateSkill={updateSoftSkill}
          onAddSkill={addSoftSkill}
          onRemoveSkill={removeSoftSkill}
          onReset={resetSoftSkills}
        />

        {/* Section 3: Qualitative Feedback */}
        <section>
          <h2 className="font-sans text-lg font-semibold text-text-primary mb-4">
            Feedback Cualitativo
          </h2>
          <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card space-y-4">
            <Textarea
              label="Fortalezas"
              value={evaluation.strengths}
              onChange={(e) => evaluation.setStrengths(e.target.value)}
              placeholder="Excelente manejo de async/await, iniciativa para buscar soluciones..."
            />
            <Textarea
              label="Áreas de mejora"
              value={evaluation.improvements}
              onChange={(e) => evaluation.setImprovements(e.target.value)}
              placeholder="Necesita mejorar la cobertura de tests, revisar nomenclatura..."
            />
            <Textarea
              label="Objetivos para la próxima semana"
              value={evaluation.goals}
              onChange={(e) => evaluation.setGoals(e.target.value)}
              placeholder="Completar el módulo de autenticación, revisar los PR pendientes..."
            />
          </div>
        </section>

        <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full sm:w-auto">
          <Save className="w-5 h-5" />
          {submitting ? "Guardando..." : "Guardar evaluación"}
        </Button>
      </div>

      {/* Sidebar - Score Breakdown */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <ScoreBreakdown
            techAverage={evaluation.techAverage}
            softAverage={evaluation.softAverage}
            weeklyAverage={evaluation.overallAverage}
          />
        </div>
      </div>
    </div>
  )
}
