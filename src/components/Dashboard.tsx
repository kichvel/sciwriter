// Directive to specify this file should run in client-side environments only.
'use client'

// Importing necessary modules and components.
import { trpc } from '@/app/_trpc/client'
import UploadButton from './UploadButton'
import {
  Ghost, Loader2, MessageSquare, Plus, Trash,
} from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from './ui/button'
import { useState } from 'react'
import { getUserSubscriptionPlan } from '@/lib/stripe'

// TypeScript interface for type safety of component props.
interface PageProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

// The main component for Dashboard, displaying user files and actions.
const Dashboard = ({ subscriptionPlan }: PageProps) => {
  // State to track which file is currently being deleted, if any.
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)

  // Utilizing tRPC context for managing data states.
  const utils = trpc.useContext()

  // Fetching files using a tRPC hook. `isLoading` is true while data is being fetched.
  const { data: files, isLoading } = trpc.getUserFiles.useQuery()

  // Mutation setup for deleting files with side-effects handled for UI updates.
  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess: () => {
      // Invalidate the file list cache on successful deletion.
      utils.getUserFiles.invalidate()
    },
    onMutate({ id }) {
      // Set the currently deleting file id to show loading indicator.
      setCurrentlyDeletingFile(id)
    },
    onSettled() {
      // Reset the currently deleting file state after operation completion.
      setCurrentlyDeletingFile(null)
    },
  })

  // Render the Dashboard UI
  return (
    <main className='mx-auto max-w-7xl md:p-10'>
      {/* Header section with title and upload button. */}
      <div className='mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0'>
        <h1 className='mb-3 font-bold text-5xl text-gray-900'>My Files</h1>
        <UploadButton isSubscribed={subscriptionPlan.isSubscribed} />
      </div>

      {/* Conditional rendering based on file data presence and loading state. */}
      {files && files?.length !== 0 ? (
        <ul className='mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3'>
          {files
            .sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg'>
                <Link
                  href={`/dashboard/${file.id}`}
                  className='flex flex-col gap-2'>
                  <div className='pt-6 px-6 flex w-full items-center justify-between space-x-6'>
                    <div className='h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500' />
                    <div className='flex-1 truncate'>
                      <div className='flex items-center space-x-3'>
                        <h3 className='truncate text-lg font-medium text-zinc-900'>{file.name}</h3>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* File metadata and delete button */}
                <div className='px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500'>
                  <div className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    {format(new Date(file.createdAt), 'MMM yyyy')}
                  </div>
                  <div className='flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4' />
                    mocked
                  </div>
                  <Button
                    onClick={() => deleteFile({ id: file.id })}
                    size='sm'
                    className='w-full'
                    variant='destructive'>
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Trash className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </li>
            ))}
