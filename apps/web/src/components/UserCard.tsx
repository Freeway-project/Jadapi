'use client'

import { Button } from '@jadapi/ui'
import { User } from '@jadapi/types'
import { Trash2, Mail } from 'lucide-react'

interface UserCardProps {
  user: User
  onUserDeleted: (userId: string) => void
}

export function UserCard({ user, onUserDeleted }: UserCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          onUserDeleted(user.id)
        } else {
          alert('Failed to delete user')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="mr-1 h-4 w-4" />
          {user.email}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Created: {new Date(user.createdAt).toLocaleDateString()}
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}