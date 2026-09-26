// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'

const wallet = vi.hoisted(() => ({ created: vi.fn(), listUploads: vi.fn() }))
vi.mock('@bsv/sdk', () => ({
  WalletClient: class { constructor(...args: unknown[]) { wallet.created(...args) } },
  StorageUploader: class { listUploads = wallet.listUploads },
  StorageDownloader: class {}
}))
vi.mock('./utils/constants.js', () => ({ default: {
  storageURL: 'https://staging-nanostore.babbage.systems',
  storageURLs: ['https://nanostore.babbage.systems', 'https://staging-nanostore.babbage.systems']
} }))

import App from './App'

afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  wallet.listUploads.mockResolvedValue([])
})

describe('public UI and wallet actions', () => {
  it('opens public downloads without connecting to a wallet', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Download Form' })).toBeTruthy()
    expect(wallet.created).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('uses the configured upload provider without eagerly connecting a wallet', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))
    expect(screen.getByRole('heading', { name: 'Upload Form' })).toBeTruthy()
    expect(screen.getByText('https://staging-nanostore.babbage.systems')).toBeTruthy()
    expect(wallet.created).not.toHaveBeenCalled()
    expect((screen.getByRole('button', { name: 'Upload' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('connects for a requested file listing with the real browser origin', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Files' }))
    expect(screen.getByText('https://staging-nanostore.babbage.systems')).toBeTruthy()
    expect(wallet.created).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Load My Files' }))
    await waitFor(() => expect(wallet.listUploads).toHaveBeenCalledOnce())
    expect(wallet.created).toHaveBeenCalledWith()
  })
})
