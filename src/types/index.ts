// Type pour l'utilisateur (authentification)
export interface User {
    firstName: any;
    lastName: any;
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'student' | 'professor' | 'admin';
    createdAt: Date | string;
  }
  
  // Type pour les étudiants
  export interface Student {
    id: string;
    userId: string;
    matricule: string;
    firstName: string;
    lastName: string;
    promotion: string;
    department: string;
    phoneNumber?: string;
    address?: string;
  }
  
  // Type pour les cours
  export interface Course {
    id: string;
    title: string;
    code: string;
    credits: number;
    instructor: string;
    department?: string;
    semester?: string;
    description?: string;
  }
  
  // Type pour les présences
  export interface Attendance {
    id: string;
    courseId: string;
    studentId: string;
    date: Date | string;
    status: 'present' | 'absent' | 'excused';
    notes?: string;
  }
  
  // Type pour les notes/résultats
  export interface Grade {
    id: string;
    studentId: string;
    courseId: string;
    examType: 'TP' | 'TD' | 'Examen' | 'Session';
    score: number;
    maxScore: number;
    date: Date | string;
    comments?: string;
  }
  
  