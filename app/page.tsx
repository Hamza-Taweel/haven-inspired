import Header from "@/components/sections/Header";
import Wordmark from "@/components/sections/Wordmark";
import VideoSection from "@/components/sections/VideoSection";
import BespokeLuxury from "@/components/sections/BespokeLuxury";
import GuidingValues from "@/components/sections/GuidingValues";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import ClientStories from "@/components/sections/ClientStories";
import Collaborators from "@/components/sections/Collaborators";
import Testimonial from "@/components/sections/Testimonial";
import Awards from "@/components/sections/Awards";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <div className="flex min-h-[72vh] flex-col">
        <Header />
        <div className="flex flex-1 flex-col justify-start pb-24">
          <Wordmark />
        </div>
      </div>
      <main>
        <VideoSection />
        <BespokeLuxury />
        <GuidingValues />
        <FeaturedProjects />
        <Collaborators />
        <Testimonial />
        <ClientStories />
        <Awards />
      </main>
      <Footer />
    </>
  );
}
