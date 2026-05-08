import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Suppress console.error in tests unless explicitly testing for errors
vi.spyOn(console, 'error').mockImplementation(() => {})
