// import { query } from "@/lib/queries";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Clock } from "lucide-react";

// Featured Course Card Component
// const FeaturedCourseCard = ({ course }) => (
//   <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//     <div className="relative h-48 bg-gray-200">
//       <img
//         src={course.imageUrl || "/api/placeholder/400/300"}
//         alt={course.title}
//         className="w-full h-full object-cover"
//       />
//     </div>
//     <div className="p-6">
//       <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
//       <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
//       <div className="flex justify-between items-center">
//         <span className="text-blue-600 font-semibold">${course.price}</span>
//         <Link
//           href={`/courses/${course.id}`}
//           className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
//         >
//           Learn more <ArrowRight size={16} />
//         </Link>
//       </div>
//     </div>
//   </div>
// );

// Feature Box Component
// const FeatureBox = ({ icon: Icon, title, description }) => (
//   <div className="p-6 bg-white rounded-lg shadow-md">
//     <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
//       <Icon className="w-6 h-6 text-blue-600" />
//     </div>
//     <h3 className="text-lg font-semibold mb-2">{title}</h3>
//     <p className="text-gray-600">{description}</p>
//   </div>
// );

export default async function HomePage() {
  // Fetch featured courses
  //   const featuredCourses = await query(
  //     "SELECT id, title, description, price, image_url FROM courses WHERE published = true ORDER BY created_at DESC LIMIT 3"
  //   );

  //   const features = [
  //     {
  //       icon: BookOpen,
  //       title: "Expert-Led Courses",
  //       description:
  //         "Learn from industry professionals with real-world experience",
  //     },
  //     {
  //       icon: Users,
  //       title: "Interactive Learning",
  //       description:
  //         "Engage with other students and instructors in a collaborative environment",
  //     },
  //     {
  //       icon: Clock,
  //       title: "Learn at Your Pace",
  //       description:
  //         "Access course content anytime, anywhere, and learn at your own speed",
  //     },
  //   ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Future with Online Learning
            </h1>
            <p className="text-xl mb-8">
              Access high-quality courses from expert instructors and take your
              skills to the next level
            </p>
            <Link
              href="/courses"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* {featuredCourses.map((course) => (
              <FeaturedCourseCard key={course.id} course={course} />
            ))} */}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              View all courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* {features.map((feature, index) => (
              <FeatureBox key={index} {...feature} />
            ))} */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already learning and growing with
            our platform.
          </p>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
