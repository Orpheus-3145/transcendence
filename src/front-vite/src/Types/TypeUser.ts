type User = {
    uniqueName: string;
    intraName: string;
    icon: string;
    isOnline: boolean;
};


export enum ChatUserRole {
    Administrator = 'Administrator',
    Guest = 'Guest',
    Owner = 'Owner',
}

type ChatUser = User & {
    role: ChatUserRole;
};