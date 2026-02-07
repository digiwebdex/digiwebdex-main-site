import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { SchemaMarkup, MultiSchemaMarkup } from '@/components/seo/SchemaMarkup';
import { seoService, WORLDWIDE_REGIONS } from '@/services/seo';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Globe, CheckCircle } from 'lucide-react';

interface LocationPage {
  id: string;
  slug: string;
  location_name_bn: string;
  location_name_en: string;
  division: string | null;
  district: string | null;
  area: string | null;
  title_bn: string;
  title_en: string;
  meta_title_bn: string | null;
  meta_title_en: string | null;
  meta_description_bn: string | null;
  meta_description_en: string | null;
  content_bn: string | null;
  content_en: string | null;
  local_business_schema: Record<string, unknown> | null;
  geo_coordinates: { lat: number; lng: number } | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  services_offered: string[] | null;
}

export function LocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [page, setPage] = useState<LocationPage | null>(null);
  const [allLocations, setAllLocations] = useState<LocationPage[]>([]);
  const [loading, setLoading] = useState(true);

  const basePath = language === 'en' ? '/en' : '/bn';
  const baseUrl = 'https://digiwebdex.com';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [pageData, locations] = await Promise.all([
          slug ? seoService.getLocationPage(slug) : Promise.resolve(null),
          seoService.getLocationPages()
        ]);
        
        setPage(pageData as LocationPage | null);
        setAllLocations(locations as LocationPage[]);
        
        if (pageData) {
          seoService.trackPageView('location_pages', pageData.id);
        }
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const getLocationName = (loc: LocationPage) => 
    language === 'bn' ? loc.location_name_bn : loc.location_name_en;
  const getTitle = (loc: LocationPage) => 
    language === 'bn' ? loc.title_bn : loc.title_en;

  // If no slug, show worldwide locations list
  if (!slug) {
    return (
      <Layout>
        <SEOHead
          title={language === 'bn' ? 'বিশ্বব্যাপী আমাদের সার্ভিস' : 'Our Worldwide Services'}
          description={language === 'bn' 
            ? 'বিশ্বের যেকোনো প্রান্তে আমাদের ওয়েব ডেভেলপমেন্ট, সফটওয়্যার এবং ডিজিটাল মার্কেটিং সেবা পাওয়া যায়।'
            : 'Our web development, software and digital marketing services are available anywhere in the world.'}
          keywords={['worldwide', 'global', 'international', 'web development', 'digital marketing', 'remote services']}
        />

        <div className="container-custom py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 text-lg px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'বিশ্বব্যাপী সেবা' : 'Global Services'}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'bn' ? 'বিশ্বের যেকোনো প্রান্তে আমাদের সেবা' : 'We Serve Clients Worldwide'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {language === 'bn'
                ? 'DigiWebDex বিশ্বের যেকোনো দেশে রিমোট সার্ভিস প্রদান করে। আমরা এশিয়া, মধ্যপ্রাচ্য, ইউরোপ, আমেরিকা সহ সব অঞ্চলে কাজ করি।'
                : 'DigiWebDex provides remote services to clients in any country. We work with businesses across Asia, Middle East, Europe, Americas, and beyond.'}
            </p>
          </div>

          {/* Global Regions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {WORLDWIDE_REGIONS.map(region => {
              const regionPages = allLocations.filter(loc => loc.division === region.slug);
              return (
                <Card key={region.slug} className="hover:shadow-lg transition-shadow hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span className="text-3xl">{region.icon}</span>
                      {language === 'bn' ? region.nameBn : region.nameEn}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {regionPages.length > 0 ? (
                      <div className="space-y-2">
                        {regionPages.slice(0, 3).map(loc => (
                          <Link 
                            key={loc.id} 
                            to={`${basePath}/locations/${loc.slug}`}
                            className="block text-muted-foreground hover:text-primary transition-colors"
                          >
                            {getLocationName(loc)}
                          </Link>
                        ))}
                        {regionPages.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{regionPages.length - 3} {language === 'bn' ? 'আরও' : 'more'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {language === 'bn' ? 'সেবা পাওয়া যায়' : 'Services available'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Why Work With Us Globally */}
          <section className="bg-muted rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {language === 'bn' ? 'বিশ্বব্যাপী কেন আমাদের বেছে নেবেন?' : 'Why Choose Us Globally?'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: '🌐', 
                  titleEn: 'Remote First', 
                  titleBn: 'রিমোট সার্ভিস',
                  descEn: 'Work with us from anywhere in the world',
                  descBn: 'বিশ্বের যেকোনো জায়গা থেকে কাজ করুন'
                },
                { 
                  icon: '💬', 
                  titleEn: 'Multi-language Support', 
                  titleBn: 'বহুভাষা সাপোর্ট',
                  descEn: 'English, Bengali & Arabic support',
                  descBn: 'ইংরেজি, বাংলা ও আরবি সাপোর্ট'
                },
                { 
                  icon: '⏰', 
                  titleEn: 'Flexible Timezone', 
                  titleBn: 'ফ্লেক্সিবল টাইমজোন',
                  descEn: 'We adjust to your business hours',
                  descBn: 'আপনার সময় অনুযায়ী কাজ করি'
                },
                { 
                  icon: '💳', 
                  titleEn: 'Global Payments', 
                  titleBn: 'গ্লোবাল পেমেন্ট',
                  descEn: 'Accept payments worldwide',
                  descBn: 'বিশ্বব্যাপী পেমেন্ট গ্রহণ'
                },
              ].map((item, index) => (
                <div key={index} className="text-center p-4">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h3 className="font-semibold mb-2">{language === 'bn' ? item.titleBn : item.titleEn}</h3>
                  <p className="text-sm text-muted-foreground">{language === 'bn' ? item.descBn : item.descEn}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'bn' ? 'আজই আপনার প্রজেক্ট শুরু করুন' : 'Start Your Project Today'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'bn'
                ? 'বিশ্বের যেকোনো প্রান্ত থেকে আমাদের সাথে যোগাযোগ করুন'
                : 'Contact us from anywhere in the world'}
            </p>
            <Link to={`${basePath}/contact`}>
              <Button size="lg" className="gradient-button">
                {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
              </Button>
            </Link>
          </section>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="container-custom py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'bn' ? 'লোকেশন পাওয়া যায়নি' : 'Location not found'}
          </h1>
          <Link to={`${basePath}/locations`}>
            <Button>{language === 'bn' ? 'সব লোকেশন দেখুন' : 'View All Locations'}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const title = language === 'bn' ? page.title_bn : page.title_en;
  const content = language === 'bn' ? page.content_bn : page.content_en;
  const metaTitle = language === 'bn' ? page.meta_title_bn : page.meta_title_en;
  const metaDescription = language === 'bn' ? page.meta_description_bn : page.meta_description_en;
  const address = language === 'bn' ? page.address_bn : page.address_en;

  const pageUrl = `${baseUrl}${basePath}/locations/${page.slug}`;

  // Generate schemas
  const schemas: Array<{ schema: Record<string, unknown>; id: string }> = [];

  // Add local business schema
  const localBusinessSchema = page.local_business_schema || seoService.generateLocalBusinessSchema({
    name: `Digiwebdex - ${getLocationName(page)}`,
    address: address ? {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: page.district || page.division || '',
      addressRegion: page.division || '',
      addressCountry: 'BD'
    } as any : undefined,
    geo: page.geo_coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: page.geo_coordinates.lat,
      longitude: page.geo_coordinates.lng
    } : undefined
  });
  schemas.push({ schema: localBusinessSchema, id: 'local-business-schema' });

  // Breadcrumb
  const breadcrumbSchema = seoService.generateBreadcrumbSchema([
    { name: language === 'bn' ? 'হোম' : 'Home', url: baseUrl },
    { name: language === 'bn' ? 'লোকেশন' : 'Locations', url: `${baseUrl}${basePath}/locations` },
    { name: getLocationName(page), url: pageUrl }
  ]);
  schemas.push({ schema: breadcrumbSchema, id: 'breadcrumb-schema' });

  return (
    <Layout>
      <SEOHead
        title={metaTitle || title}
        description={metaDescription || ''}
        keywords={[getLocationName(page), 'web development', 'digital marketing', 'Bangladesh']}
        canonicalUrl={pageUrl}
      />
      <MultiSchemaMarkup schemas={schemas} />

      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
        <Badge className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            {page.division && (language === 'bn' 
              ? WORLDWIDE_REGIONS.find(d => d.slug === page.division)?.nameBn 
              : WORLDWIDE_REGIONS.find(d => d.slug === page.division)?.nameEn)}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
          
          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {address}
              </span>
            )}
            {page.phone && (
              <a href={`tel:${page.phone}`} className="flex items-center gap-1 hover:text-primary">
                <Phone className="h-4 w-4" />
                {page.phone}
              </a>
            )}
          </div>
        </div>

        {/* Services Offered */}
        {page.services_offered && page.services_offered.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'bn' ? 'এই এলাকায় আমাদের সেবাসমূহ' : 'Our Services in This Area'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {page.services_offered.map((service, index) => (
                <div key={index} className="flex items-center gap-2 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Content */}
        {content && (
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Other Locations */}
        {allLocations.length > 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'bn' ? 'অন্যান্য লোকেশন' : 'Other Locations'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allLocations
                .filter(loc => loc.id !== page.id)
                .slice(0, 8)
                .map(loc => (
                  <Link key={loc.id} to={`${basePath}/locations/${loc.slug}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <span className="font-medium">{getLocationName(loc)}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-muted rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'bn' 
              ? `${getLocationName(page)} এ সেবা নিতে চান?` 
              : `Need Services in ${getLocationName(page)}?`}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'bn'
              ? 'আজই আমাদের সাথে যোগাযোগ করুন এবং আপনার প্রজেক্ট নিয়ে আলোচনা করুন।'
              : 'Contact us today and discuss your project with our team.'}
          </p>
          <Link to={`${basePath}/contact`}>
            <Button size="lg" className="gradient-button">
              {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
}
