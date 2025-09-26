import { Button } from '@jadapi/ui'
import { User } from 'lucide-react'
import { UserList } from '../components/UserList'

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Jadapi
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A modern monorepo with Next.js, Express API, and shared packages
          </p>
          <div className="flex gap-4 justify-center">
            <Button>
              <User className="mr-2 h-4 w-4" />
              Get Started
            </Button>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="w-full max-w-4xl">
          <UserList />
        </div>
      </div>
    </main>
  )
}