import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Brain,
  BarChart3,
  Cloud,
  Upload,
  TrendingUp,
  Shield,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Leaf,
  Sun,
  Droplets,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Crop Recommendation",
      description:
        "Get personalized crop suggestions based on soil conditions, climate data, and agricultural best practices.",
      href: "/crop-recommendation",
      color: "primary",
    },
    {
      icon: BarChart3,
      title: "Advanced Soil Analysis",
      description:
        "Upload soil images for instant classification and receive detailed health assessments with improvement recommendations.",
      href: "/soil-analysis",
      color: "secondary",
    },
    {
      icon: Cloud,
      title: "Real-time Weather Monitoring",
      description:
        "Access current weather conditions, forecasts, and agricultural advisories tailored to your location.",
      href: "/weather",
      color: "accent",
    },
    {
      icon: Upload,
      title: "Smart Data Management",
      description:
        "Upload, validate, and analyze your agricultural data with our powerful data processing tools.",
      href: "/data",
      color: "primary",
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Crop Yields",
      description:
        "Optimize your farming decisions with data-driven insights to maximize productivity and profitability.",
    },
    {
      icon: Shield,
      title: "Reduce Risks",
      description:
        "Make informed decisions with weather alerts, soil health monitoring, and predictive analytics.",
    },
    {
      icon: Users,
      title: "Expert Knowledge",
      description:
        "Access agricultural expertise and best practices backed by scientific research and machine learning.",
    },
    {
      icon: Award,
      title: "Sustainable Farming",
      description:
        "Promote environmentally friendly practices with precision agriculture and resource optimization.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Farmers Served" },
    { number: "95%", label: "Prediction Accuracy" },
    { number: "30%", label: "Average Yield Increase" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 leading-tight">
                Smart Farming with
                <span className="text-gradient block">AI Technology</span>
              </h1>

              <p className="text-xl text-neutral-600 leading-relaxed">
                Revolutionize your agricultural practices with our comprehensive
                platform that combines machine learning, weather data, and soil
                analysis to optimize crop yields and promote sustainable
                farming.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/crop-recommendation"
                  className="btn-primary btn-animated text-lg px-8 py-3 text-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </Link>
                {!isAuthenticated() && (
                  <Link
                    to="/register"
                    className="btn-outline text-lg px-8 py-3 text-center"
                  >
                    Create Account
                  </Link>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {stat.number}
                    </div>
                    <div className="text-sm text-neutral-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="relative slide-in-right">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <Leaf className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Crop Health</div>
                    <div className="text-2xl font-bold">98%</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <Sun className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Weather</div>
                    <div className="text-2xl font-bold">25°C</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Soil Quality</div>
                    <div className="text-2xl font-bold">A+</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 text-center">
                    <Droplets className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">Irrigation</div>
                    <div className="text-2xl font-bold">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              Comprehensive Agricultural Solutions
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our platform integrates cutting-edge technology with agricultural
              expertise to provide you with the tools needed for successful
              farming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                primary: "bg-primary-600 text-white",
                secondary: "bg-secondary-600 text-white",
                accent: "bg-accent-600 text-white",
              };

              return (
                <div key={index} className="feature-card card-hover p-8 h-full">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-xl ${
                        colorClasses[feature.color]
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <Link
                        to={feature.href}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                      >
                        Learn More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              Why Choose AgroTech?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Join thousands of farmers who have transformed their agricultural
              practices with our innovative solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Get started with AgroTech in three simple steps and begin
              optimizing your farming operations today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Input Your Data",
                description:
                  "Provide soil conditions, location, and crop preferences through our intuitive interface.",
              },
              {
                step: "02",
                title: "AI Analysis",
                description:
                  "Our machine learning algorithms analyze your data along with weather patterns and agricultural best practices.",
              },
              {
                step: "03",
                title: "Get Recommendations",
                description:
                  "Receive personalized recommendations for crops, fertilizers, and farming practices to maximize your yield.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the agricultural revolution and start making data-driven
            farming decisions today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/crop-recommendation"
              className="bg-white text-primary-600 hover:bg-primary-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
            >
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!isAuthenticated() && (
              <Link
                to="/register"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
