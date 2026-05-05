import AnnouncementBar from "../../sections/AnnouncementBar.jsx";
import Footer from "../../sections/Footer.jsx";
import HomeHeader from "../../sections/HomeHeader.jsx";

const ToolsLayout = ({ children, className = "" }) => (
  <div className={`page-shell tools-shell ${className}`}>
    <AnnouncementBar />
    <HomeHeader />
    <main className="page-content tools-page-layout">{children}</main>
    <Footer />
  </div>
);

export default ToolsLayout;
