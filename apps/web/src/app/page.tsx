import { Button } from '@jadapi/ui';
import { UserForm } from '@/components/user-form';

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Jadapi
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            A modern monorepo with Next.js, Express, and shared packages
          </p>
        </div>
        
        <div className="grid gap-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Create User</h2>
            <UserForm />
          </div>
          
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Shared UI Demo</h2>
            <div className="flex gap-4">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}