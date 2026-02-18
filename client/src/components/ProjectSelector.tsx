import type { Project } from '../types'

interface ProjectSelectorProps {
  projects: Project[]
  selectedProjectId: string | null
  onProjectChange: (projectId: string) => void
}

function ProjectSelector({ projects, selectedProjectId, onProjectChange }: ProjectSelectorProps) {
  return (
    <div className="d-flex align-items-center gap-2">
      <label className="mb-0">Projet:</label>
      <select
        className="form-select form-select-sm bg-dark text-light border-secondary"
        style={{ width: 'auto' }}
        value={selectedProjectId ?? ''}
        onChange={(e) => onProjectChange(e.target.value)}
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.description}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ProjectSelector
