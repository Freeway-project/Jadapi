'use client'

import { useState, useEffect } from 'react'
import { Button } from '@jadapi/ui'
import { User, ApiResponse } from '@jadapi/types'
import { UserCard } from './UserCard'
import { CreateUserForm } from './CreateUserForm'

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data: ApiResponse<User[]> = await response.json()
        if (data.success && data.data) {
          setUsers(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserCreated = (newUser: User) => {
    setUsers([...users, newUser])
    setShowForm(false)
  }

  const handleUserDeleted = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return <div className="text-center">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {showForm && (
        <CreateUserForm 
          onUserCreated={handleUserCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No users found. Create your first user!
          </div>
        ) : (
          users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onUserDeleted={handleUserDeleted}
            />
          ))
        )}
      </div>
    </div>
  )
}