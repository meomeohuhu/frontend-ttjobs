import HomeHeader from "../sections/HomeHeader.jsx";
import AnnouncementBar from "../sections/AnnouncementBar.jsx";
import HeroSearch from "../sections/HeroSearch.jsx";
import BestJobsSection from "../sections/BestJobsSection.jsx";
import HighlightJobsSection from "../sections/HighlightJobsSection.jsx";
import BrandsSection from "../sections/BrandsSection.jsx";
import FloatingActions from "../sections/FloatingActions.jsx";

const Home = () => {
  return (
    <div className="topcv-shell">
      <HomeHeader />
      <AnnouncementBar />
      <HeroSearch />
      <BestJobsSection />
      <HighlightJobsSection />
      <BrandsSection />
      <FloatingActions />
    </div>
  );
};

export default Home;
