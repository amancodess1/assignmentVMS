import { render, screen } from '@testing-library/react'
import RoutesTab from '../RoutesTab'
import { describe, it, expect } from 'vitest'

describe('RoutesTab', ()=>{
  it('renders header', ()=>{
    render(<RoutesTab />)
    expect(screen.getByText('Routes')).toBeTruthy()
  })
})
