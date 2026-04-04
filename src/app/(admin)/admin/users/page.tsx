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
import { MoreHorizontal } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="h-8 w-8 rounded-full bg-slate-300"></div>
              </TableCell>
              <TableCell className="font-medium">Admin User</TableCell>
              <TableCell>admin@janopriyoshop.com</TableCell>
              <TableCell>
                <Badge>Admin</Badge>
              </TableCell>
              <TableCell>Jan 1, 2026</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="h-8 w-8 rounded-full bg-slate-300"></div>
              </TableCell>
              <TableCell className="font-medium">Common User</TableCell>
              <TableCell>user@example.com</TableCell>
              <TableCell>
                <Badge variant="outline">User</Badge>
              </TableCell>
              <TableCell>Feb 15, 2026</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
