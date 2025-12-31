# Chitrakala - Digital Art Gallery

A premium digital art gallery platform connecting Nepali artists with global collectors.

## 🚀 How to Run the Application

This project is built with React and Vite. Follow these steps to start the development server.

### Prerequisites
- Node.js installed on your system.

### Steps
1. **Open Terminal** (PowerShell or Command Prompt).
2. **Navigate to the project folder**:
   ```powershell
   cd d:\digital-art-gallery
   ```
3. **Install Dependencies** (First time only):
   ```powershell
   npm install
   ```
4. **Start the Development Server**:
   ```powershell
   $env:Path = "C:\Program Files\nodejs;" + $env:Path; & "C:\Program Files\nodejs\npm.cmd" run dev
   ```
   *(Note: The `& "C:\..."` part ensures we run the command version, avoiding PowerShell script errors)*.

5. **Open in Browser**:
   - Access the application at the URL shown in the terminal (e.g., `http://localhost:5173`).

## 👥 User Roles
- **Guest**: Browse gallery, view details.
- **Collector**: Add to cart, checkout (mock), view profile.
- **Artist**: Upload artwork (with photo support), view portfolio stats.
- **Admin**: Manage users and artworks.

## ✨ Key Features
- **Dynamic Gallery**: Artworks added by artists appear instantly.
- **Shopping Cart**: Fully functional cart with persistent state.
- **Role-Based Dashboards**: Dedicated areas for Artists and Admins.
- **Premium UI**: Modern dark theme with gold accents and smooth animations.
