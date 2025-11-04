import Sidebar from './Sidebar';

const Layout = ({ admin, onLogout, children }) => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
      <Sidebar admin={admin} onLogout={onLogout} />
      <div className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;