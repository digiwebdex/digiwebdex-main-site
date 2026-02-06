import React from 'react';
import { Layout } from '@/components/layout';
import { HeroSection, ServicesSection, FeaturesSection, CTASection } from '@/components/home';

const Home = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
};

export default Home;
