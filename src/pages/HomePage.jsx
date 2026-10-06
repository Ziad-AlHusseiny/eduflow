import Hero from '../components/landing/Hero.jsx';
import { CategoryGrid, CtaBanner, FeaturedCourses, HowItWorks, InstructorHighlights, PathsTeaser, Testimonials } from '../components/landing/Sections.jsx';

/** Landing (PRD §3): Hero → Categories → Featured → How it works → Paths → Instructors → Testimonials → CTA. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedCourses />
      <HowItWorks />
      <PathsTeaser />
      <InstructorHighlights />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
