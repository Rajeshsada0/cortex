import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const candidateId = `#AIIMS-${String(user.id || 1).padStart(4, '0')}`;

    return (
        <>
            <Avatar className="size-8 overflow-hidden rounded-full border border-cyan-500/30 ring-1 ring-cyan-500/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[#0e2238] text-xs font-bold text-cyan-400">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">
                    {user.name}
                </span>
                <span className="truncate text-[10px] font-medium text-slate-400">
                    Candidate {candidateId}
                </span>
            </div>
        </>
    );
}
