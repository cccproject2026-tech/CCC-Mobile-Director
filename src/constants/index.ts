export interface MenuItem {
    id: string;
    label: string;
    icon: string | any;
    iconType?: 'ionicon' | 'image';
    route?: string;
    badge?: number;
    showChevron?: boolean;
    children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
    { id: 'new-interests', label: 'New Interests', icon: 'people-outline', route: '/(director)/(tabs)/new-interests', badge: 6 },
    { id: 'all-mentors', label: 'All Mentors', icon: 'school-outline', route: '/(director)/(tabs)/mentors' },
    { id: 'all-pastors', label: 'All Pastors', icon: 'people-outline', route: '/(director)/(tabs)/mentees' },
    { id: 'course-completed', label: 'Course Completed', icon: 'ribbon-outline', route: '/(director)/(tabs)', badge: 6 },
    { id: 'track-progress', label: 'Track Progress', icon: 'bar-chart-outline', route: '/(director)/(tabs)/progress-tracker' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar-outline', route: '/(director)/(tabs)/appointments' },
    { id: 'roadmaps', label: 'Revitalization Roadmaps', icon: 'clipboard-outline', route: '/(director)/(tabs)/revitalization-roadmaps' },
    { id: 'assessments', label: 'Assessments', icon: 'checkmark-done-outline', route: '/(director)/(tabs)/assessments' },
    { id: 'courses', label: 'Courses', icon: 'book-outline', route: '/(director)/(tabs)' },
    {
        id: 'ccc',
        label: 'CCC',
        icon: 'flame-outline',
        children: [
            { id: 'micro-grant', label: 'Micro Grant', icon: 'trophy-outline', route: '/(director)/(tabs)/micro-grant' },
            { id: 'invite-mentor', label: 'Invite to be a Field Mentor', icon: 'person-add-outline', route: '/(director)/(tabs)' },
            { id: 'interest-form', label: 'Interest Form', icon: 'document-text-outline', route: '/(director)/(tabs)/new-interests/interest-form' },
            { id: 'products', label: 'Product and Services', icon: 'cart-outline', route: '/(director)/(tabs)/product-and-services', showChevron: true },
            { id: 'videos', label: 'CCC - Videos', icon: 'videocam-outline', route: '/(director)/(tabs)', showChevron: true },
            { id: 'contact-details', label: 'CCC - Contact Details', icon: 'call-outline', route: '/(director)/(tabs)', showChevron: true },
            { id: 'reports', label: 'Reports', icon: 'document-outline', route: '/(director)/(tabs)' },
        ],
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: 'person-outline',
        children: [
            { id: 'my-profile', label: 'My Profile', icon: 'profile-outline', iconType: 'image', route: '/(director)/(tabs)/profile' },
            { id: 'documents', label: 'Documents', icon: 'folder-outline', route: '/(director)/(tabs)/documents' },
            { id: 'notes', label: 'Notes', icon: 'document-text-outline', route: '/(director)/(tabs)/documents' },
        ],
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'settings-outline',
        children: [
            { id: 'change-password', label: 'Change Password', icon: 'lock-closed-outline', route: '/(director)/(tabs)' },
            { id: 'notifications', label: 'Turn Off Notifications', icon: 'notifications-off-outline', route: '/(director)/(tabs)' },
        ],
    },
    { id: 'logout', label: 'Log out', icon: 'log-out-outline', route: '/' },
];


export const icons = {
    myProfile: require('@/assets/images/app/myProfile.png'),
    duoMeet: require('@/assets/images/app/zoom_icon.png'),
    googleMeet: require('@/assets/images/app/google_meet_icon.png'),
}