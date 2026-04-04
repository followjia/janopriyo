import { User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function AdminTopbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1 font-semibold text-lg md:hidden">
          Admin Panel
        </div>
      </div>
      <div className="hidden md:flex flex-1" />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <ModeToggle />
        <Button variant="secondary" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </div>
    </header>
  );
}
