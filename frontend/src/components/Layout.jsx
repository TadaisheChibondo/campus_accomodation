import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* 'pt-16' adds padding to the top so content isn't hidden behind the fixed navbar */}
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default Layout;
