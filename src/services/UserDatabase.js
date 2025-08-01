// Service for managing user database
class UserDatabase {
  constructor() {
    this.storageKey = 'healthos_users';
    this.initializeDatabase();
  }

  // Initialize database with demo users
  initializeDatabase() {
    const existingUsers = this.getAllUsers();
    // Force reinitialize if demo users are missing or corrupted
    const hasValidDemoUsers = existingUsers.some(u => u.email === 'nurse@healthos.com' && u.role === 'nurse');
    if (existingUsers.length === 0 || !hasValidDemoUsers) {
      const demoUsers = [
        {
          id: '1',
          email: 'admin@healthos.com',
          password: 'admin123',
          firstName: 'Administrador',
          lastName: 'Sistema',
          role: 'admin',
          specialty: 'Administración',
          licenseNumber: 'ADM001',
          phone: '+34 600 000 001',
          address: 'Calle Principal 1, Madrid',
          dateOfBirth: '1980-01-01',
          isActive: true,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'doctor@healthos.com',
          password: 'doctor123',
          firstName: 'Dr. Juan',
          lastName: 'García',
          role: 'doctor',
          specialty: 'Cardiología',
          licenseNumber: 'MED001',
          phone: '+34 600 000 002',
          address: 'Avenida Salud 15, Barcelona',
          dateOfBirth: '1975-05-15',
          isActive: true,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          email: 'nurse@healthos.com',
          password: 'nurse123',
          firstName: 'María',
          lastName: 'López',
          role: 'nurse',
          specialty: 'Enfermería General',
          licenseNumber: 'ENF001',
          phone: '+34 600 000 003',
          address: 'Plaza Medicina 8, Valencia',
          dateOfBirth: '1985-09-20',
          isActive: true,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '4',
          email: 'patient@healthos.com',
          password: 'patient123',
          firstName: 'Ana',
          lastName: 'Martínez',
          role: 'patient',
          specialty: 'Paciente',
          licenseNumber: 'PAT001',
          phone: '+34 600 000 004',
          address: 'Calle Salud 12, Sevilla',
          dateOfBirth: '1990-03-10',
          isActive: true,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveUsers(demoUsers);
    }
  }

  // Get all users
  getAllUsers() {
    try {
      const users = localStorage.getItem(this.storageKey);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Save users to localStorage
  saveUsers(users) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  }

  // Create new user
  createUser(userData) {
    try {
      const users = this.getAllUsers();
      
      // Check if email already exists
      if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'User with this email already exists' };
      }

      const newUser = {
        id: this.generateId(),
        ...userData,
        isActive: true,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      
      if (this.saveUsers(users)) {
        return { success: true, user: newUser };
      } else {
        return { success: false, error: 'Error saving user' };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Get user by ID
  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id);
  }

  // Get user by email
  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email === email);
  }

  // Update user
  updateUser(id, updateData) {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // If updating email, check that it doesn't exist
      if (updateData.email && updateData.email !== users[userIndex].email) {
        if (users.find(u => u.email === updateData.email && u.id !== id)) {
          return { success: false, error: 'Email already in use' };
        }
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      if (this.saveUsers(users)) {
        return { success: true, user: users[userIndex] };
      } else {
        return { success: false, error: 'Error updating user' };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Delete user
  deleteUser(id) {
    try {
      const users = this.getAllUsers();
      const filteredUsers = users.filter(u => u.id !== id);
      
      if (users.length === filteredUsers.length) {
        return { success: false, error: 'User not found' };
      }

      if (this.saveUsers(filteredUsers)) {
        return { success: true };
      } else {
        return { success: false, error: 'Error deleting user' };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Authenticate user
  authenticateUser(email, password) {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Update last login
        this.updateUser(user.id, { lastLogin: new Date().toISOString() });
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Incorrect email or password' };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  // Search users
  searchUsers(query) {
    const users = this.getAllUsers();
    const searchTerm = query.toLowerCase();
    
    return users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.specialty.toLowerCase().includes(searchTerm)
    );
  }

  // Filter users by role
  getUsersByRole(role) {
    const users = this.getAllUsers();
    return users.filter(u => u.role === role);
  }

  // Filter users by specialty
  getUsersBySpecialty(specialty) {
    const users = this.getAllUsers();
    return users.filter(u => u.specialty === specialty);
  }

  // Get user statistics
  getUserStats() {
    const users = this.getAllUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const doctorUsers = users.filter(u => u.role === 'user').length;
    const specialties = [...new Set(users.map(u => u.specialty))].length;
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      doctorUsers,
      specialties
    };
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Export user data (for backup)
  exportUsers() {
    const users = this.getAllUsers();
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `healthos_users_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Import user data
  importUsers(jsonData) {
    try {
      const users = JSON.parse(jsonData);
      if (Array.isArray(users)) {
        this.saveUsers(users);
        return { success: true, message: `Imported ${users.length} users` };
      } else {
        return { success: false, error: 'Invalid data format' };
      }
    } catch (error) {
      console.error('Error importing users:', error);
      return { success: false, error: 'Error processing file' };
    }
  }

  // Clean database (keep only demo users)
  resetDatabase() {
    localStorage.removeItem(this.storageKey);
    this.initializeDatabase();
    return { success: true, message: 'Database reset' };
  }
}

// Create singleton instance
const userDatabase = new UserDatabase();

export default userDatabase;