import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Box, 
  AlertTriangle, 
  FileText, 
  LogOut,
  Coffee,
  Menu,
  X,
  Settings,
  Monitor,
  Map,
  Package
} from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator'] },
    { path: '/sales', label: 'Ventas', icon: ShoppingCart, roles: ['admin', 'operator'] },
    { path: '/inventory', label: 'Inventario', icon: Box, roles: ['admin', 'operator'] },
    { path: '/complaints', label: 'Reclamos', icon: AlertTriangle, roles: ['admin', 'operator'] },
  ];

  const adminMenu = [
    { path: '/products', label: 'Productos', icon: Settings, roles: ['admin'] },
    { path: '/supplies', label: 'Insumos', icon: Package, roles: ['admin'] },
    { path: '/plazas', label: 'Plazas', icon: Map, roles: ['admin'] },
    { path: '/machines', label: 'Equipos', icon: Monitor, roles: ['admin'] },
    { path: '/reports', label: 'Reportes', icon: FileText, roles: ['admin'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));
  const filteredAdmin = adminMenu.filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar - Desktop */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--color-primary)', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        left: 0,
        top: 0
      }} className="desktop-sidebar">
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'var(--color-accent)' }}><Coffee size={28} /></div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>VLB App</span>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
          <div style={{ marginBottom: '1rem', paddingLeft: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
            Menu
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredMenu.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  })}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          
          {filteredAdmin.length > 0 && (
            <>
              <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem', paddingLeft: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
                Administración
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredAdmin.map((item) => (
                  <li key={item.path}>
                    <NavLink 
                      to={item.path}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      })}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.[0]}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{user?.role === 'admin' ? 'Administrador' : 'Operario'}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem', 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.7)', 
              cursor: 'pointer',
              fontSize: '0.875rem' 
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '2rem' }} className="main-content">
        <Outlet />
      </main>

      {/* Mobile styles injection for sidebar */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
