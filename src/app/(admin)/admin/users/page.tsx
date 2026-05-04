'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Users Management</h1>
          <p className="text-muted-foreground text-sm">Manage and view all registered customers and staff.</p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <span className="text-primary font-bold text-sm">{users.length} Total Users</span>
        </div>
      </div>

      <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Loading user data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <p className="text-muted-foreground">No users found.</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    {user.image ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border">
                        <Image 
                          src={user.image} 
                          alt={user.name} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <UserIcon className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{user.name}</div>
                  </TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'outline'}
                      className={`
                        capitalize px-3 py-0.5 rounded-full font-bold text-[10px] tracking-wider
                        ${user.role === 'super_admin' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                        ${user.role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      `}
                    >
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
