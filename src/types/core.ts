export interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string | null;
    order: number;
    is_active: boolean;
}
