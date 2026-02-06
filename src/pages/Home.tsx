import React from 'react';
import { Layout } from '@/components/layout';
import { HeroSection, ServicesSection, FeaturesSection, CTASection } from '@/components/home';
import { AffiliateTracker } from '@/components/affiliate';

const Home = () => {
  return (
    <Layout>
      <AffiliateTracker />
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
};

export default Home;
