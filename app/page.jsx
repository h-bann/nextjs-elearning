import Link from "next/link";
import { ArrowRight, BookOpen, Users, Clock } from "lucide-react";
import FooterComponent from "@/components/layout/Footer";

// Feature Box Component
const FeatureBox = ({ icon: Icon, title, description }) => (
  <div className="rounded-lg bg-secondary p-6 shadow-md">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary bg-opacity-20">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-charcoal mb-2 text-lg font-medium">{title}</h3>
    <p className="text-charcoal">{description}</p>
  </div>
);

export default async function HomePage() {
  // Sample feature content
  const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description:
        "Learn from industry professionals with real-world experience",
    },
    {
      icon: Users,
      title: "Interactive Learning",
      description:
        "Engage with other students and instructors in a collaborative environment",
    },
    {
      icon: Clock,
      title: "Learn at Your Pace",
      description:
        "Access course content anytime, anywhere, and learn at your own speed",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary py-20 text-secondary">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-medium md:text-5xl">
              MAIN TITLE HERE
            </h1>
            <p className="mb-8 text-xl font-extralight">
              Brief description of the site here
            </p>
            <Link
              href="/courses"
              className="text-charcoal rounded-lg bg-accent px-8 py-3 font-medium transition-colors hover:bg-accent-hover"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-medium text-primary">
            Featured Courses
          </h2>
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-2 lg:grid-cols-3">
            {/* Course cards would go here */}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary-light"
            >
              View all courses <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section  */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-medium text-primary">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureBox key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-semibold text-primary">
            Ready to Start Learning?
          </h2>
          <p className="text-charcoal mx-auto mb-8 max-w-2xl">
            Join thousands of students who are already learning and growing with
            our platform.
          </p>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-accent px-8 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Get Started
          </Link>
        </div>
      </section>

      <FooterComponent />
    </div>
  );
}
