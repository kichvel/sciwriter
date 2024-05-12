// Directive to run the code only in the client-side environment.
'use client'

// Import necessary modules and components for subscription management and UI.
import { getUserSubscriptionPlan } from '@/lib/stripe'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import MaxWidthWrapper from './MaxWidthWrapper'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

// TypeScript interface to define props structure.
interface BillingFormProps {
  subscriptionPlan: Awaited<
    ReturnType<typeof getUserSubscriptionPlan>
  >
}

// Functional component for handling the billing form related to user subscriptions.
const BillingForm = ({
  subscriptionPlan,
}: BillingFormProps) => {
  // Custom hook to show toast notifications.
  const { toast } = useToast()

  // tRPC mutation hook for creating Stripe sessions and handling redirection or errors.
  const { mutate: createStripeSession, isLoading } =
    trpc.createStripeSession.useMutation({
      onSuccess: ({ url }) => {
        // Redirect to Stripe if URL is provided, otherwise show an error notification.
        if (url) window.location.href = url
        if (!url) {
          toast({
            title: 'There was a problem...',
            description: 'Please try again in a moment',
            variant: 'destructive',
          })
        }
      },
    })

  // Component rendering logic.
  return (
    <MaxWidthWrapper className='max-w-5xl'>
      {/* Form submission to handle Stripe session creation */}
      <form
        className='mt-12'
        onSubmit={(e) => {
          e.preventDefault()  // Prevent default form submission.
          createStripeSession()  // Trigger Stripe session creation.
        }}>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            {/* Display the current subscription plan */}
            <CardDescription>
              You are currently on the <strong>{subscriptionPlan.name}</strong> plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>
            {/* Conditionally render buttons and subscription details */}
            <Button type='submit'>
              {isLoading ? (
                <Loader2 className='mr-4 h-4 w-4 animate-spin' />  // Show loader when processing
              ) : null}
              {subscriptionPlan.isSubscribed ? 'Manage Subscription' : 'Upgrade to PRO'}
            </Button>

            {subscriptionPlan.isSubscribed && (
              <p className='rounded-full text-xs font-medium'>
                {subscriptionPlan.isCanceled ? 'Your plan will be canceled on ' : 'Your plan renews on'}
                {format(
                  subscriptionPlan.stripeCurrentPeriodEnd!,
                  'dd.MM.yyyy'
                )}
              </p>
            )}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  )
}

// Export the component for use in other parts of the application.
export default BillingForm
