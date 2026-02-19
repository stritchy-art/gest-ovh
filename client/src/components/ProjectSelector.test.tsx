import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectSelector from './ProjectSelector'

describe('ProjectSelector', () => {
  const mockProjects = [
    { id: 'project-1', description: 'Test Project 1' },
    { id: 'project-2', description: 'Test Project 2' },
    { id: 'project-3', description: 'Test Project 3' },
  ]

  it('should render all projects in select dropdown', () => {
    render(
      <ProjectSelector
        projects={mockProjects}
        selectedProjectId="project-1"
        onProjectChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('Test Project 1')
    expect(options[1]).toHaveTextContent('Test Project 2')
    expect(options[2]).toHaveTextContent('Test Project 3')
  })

  it('should select the correct project by default', () => {
    render(
      <ProjectSelector
        projects={mockProjects}
        selectedProjectId="project-2"
        onProjectChange={() => {}}
      />
    )

    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('project-2')
  })

  it('should call onProjectChange when selection changes', async () => {
    const user = userEvent.setup()
    const onProjectChange = vi.fn()

    render(
      <ProjectSelector
        projects={mockProjects}
        selectedProjectId="project-1"
        onProjectChange={onProjectChange}
      />
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'project-3')

    expect(onProjectChange).toHaveBeenCalledWith('project-3')
  })
})
