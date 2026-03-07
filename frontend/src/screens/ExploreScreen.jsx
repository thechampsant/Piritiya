import React, { useState, useMemo } from 'react';
import { PillChip, AmbientBg } from '@ds/components';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';
import { Wheat, Leaf, CloudRain, TrendingUp, Bug } from '@ds/icons';
import { useChatContext } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import LangSheet from './components/LangSheet';

const TAG_STYLES = {
  alert:   { background: 'rgba(239,68,68,0.15)',  color: '#dc2626', label: { hi: 'अलर्ट',  en: 'ALERT'   } },
  tip:     { background: 'rgba(52,211,153,0.15)', color: '#059669', label: { hi: 'सुझाव',   en: 'TIP'     } },
  market:  { background: 'rgba(96,165,250,0.15)', color: '#2563eb', label: { hi: 'बाज़ार',  en: 'Market'  } },
  trending:{ background: 'rgba(234,179,8,0.2)',   color: '#ca8a04', label: { hi: 'ट्रेंडिंग', en: 'TRENDING'} },
  pest:    { background: 'rgba(167,139,250,0.15)', color: '#7c3aed', label: { hi: 'कीट',     en: 'Pest'    } },
};

const CATEGORY_ICONS = {
  crops:   { Icon: Wheat,      bg: 'rgba(19,136,8,0.1)',    color: '#138808' },
  soil:    { Icon: Leaf,       bg: 'rgba(19,136,8,0.1)',    color: '#138808' },
  weather: { Icon: CloudRain,  bg: 'rgba(96,165,250,0.1)',  color: '#3b82f6' },
  market:  { Icon: TrendingUp, bg: 'rgba(96,165,250,0.1)',  color: '#2563eb' },
  pests:   { Icon: Bug,        bg: 'rgba(167,139,250,0.1)', color: '#7c3aed' },
};

/**
 * ExploreScreen - Content discovery
 * Browse agricultural articles organized by category
 *
 * Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7
 */
const ExploreScreen = ({ onNavigate }) => {
  const { sendMessage } = useChatContext();
  const { language } = useLanguage();
  const { setLanguage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLangSheet, setShowLangSheet] = useState(false);

  const categories = [
    { id: 'all',     label: language === 'hi' ? 'सभी'    : 'All'     },
    { id: 'soil',    label: language === 'hi' ? 'मिट्टी' : 'Soil'    },
    { id: 'crops',   label: language === 'hi' ? 'फसलें'  : 'Crops'   },
    { id: 'market',  label: language === 'hi' ? 'बाज़ार'  : 'Market'  },
    { id: 'weather', label: language === 'hi' ? 'मौसम'   : 'Weather' },
    { id: 'pests',   label: language === 'hi' ? 'कीट'    : 'Pests'   },
  ];

  const articles = useMemo(() => {
    if (language === 'hi') {
      return [
        { id: '1', title: 'आगरा मंडल में टिड्डी हमले का अलर्ट',  description: 'उत्तर प्रदेश के कई जिलों में टिड्डी दल की रिपोर्ट। किसान सतर्क रहें।', category: 'pests',   tagType: 'alert',  readTime: '3', query: 'टिड्डी से फसल बचाने के उपाय',        accentColor: '#FF9933' },
        { id: '2', title: 'खरीफ 2024: धान की उन्नत किस्में',      description: '',                                                                         category: 'crops',   tagType: 'tip',    readTime: '5', query: 'धान की उन्नत किस्मों के बारे में',  accentColor: '#138808' },
        { id: '3', title: 'सरसों के भाव 8% बढ़े — 3 महीने में बेचने का सही समय', description: '',                                                                         category: 'market',  tagType: 'trending', readTime: '2', query: 'आज के बाजार भाव दिखाएं',             accentColor: '#60a5fa' },
        { id: '4', title: 'फसल को कीट से बचाने के 7 तरीके',      description: '',                                                                         category: 'pests',   tagType: 'pest',   readTime: '4', query: 'फसल में कीट नियंत्रण के उपाय',     accentColor: '#a78bfa' },
        { id: '5', title: 'मिट्टी की नमी को कैसे बनाए रखें',     description: '',                                                                         category: 'soil',    tagType: 'tip',    readTime: '4', query: 'मिट्टी की नमी बनाए रखने के तरीके', accentColor: '#138808' },
        { id: '6', title: 'मानसून के मौसम की तैयारी',             description: '',                                                                         category: 'weather', tagType: 'alert',  readTime: '3', query: 'मानसून के लिए खेत की तैयारी',       accentColor: '#60a5fa' },
      ];
    }
    return [
      { id: '1', title: 'Locust Attack Alert in Agra Region',   description: 'Reports of locust swarms in several UP districts. Farmers should stay alert.',  category: 'pests',   tagType: 'alert',  readTime: '3', query: 'How to protect crops from locusts',     accentColor: '#FF9933' },
      { id: '2', title: 'Kharif 2024: Improved Rice Varieties', description: '',                                                                                 category: 'crops',   tagType: 'tip',    readTime: '5', query: 'Tell me about improved rice varieties',  accentColor: '#138808' },
      { id: '3', title: 'Mustard prices up 8% — best time to sell in 3 months', description: '',                                                                                 category: 'market',  tagType: 'trending', readTime: '2', query: "Show today's market prices",             accentColor: '#60a5fa' },
      { id: '4', title: '7 Ways to Protect Crops from Pests',   description: '',                                                                                 category: 'pests',   tagType: 'pest',   readTime: '4', query: 'Pest control measures for crops',        accentColor: '#a78bfa' },
      { id: '5', title: 'How to Maintain Soil Moisture',        description: '',                                                                                 category: 'soil',    tagType: 'tip',    readTime: '4', query: 'Ways to maintain soil moisture',         accentColor: '#138808' },
      { id: '6', title: 'Preparing for Monsoon Season',         description: '',                                                                                 category: 'weather', tagType: 'alert',  readTime: '3', query: 'How to prepare farm for monsoon',        accentColor: '#60a5fa' },
    ];
  }, [language]);

  const filteredArticles = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return articles;
    return articles.filter((a) => a.category === selectedCategory);
  }, [articles, selectedCategory]);

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
  };

  const handleArticleClick = async (article) => {
    try {
      await sendMessage(article.query);
      if (onNavigate) onNavigate('chat');
    } catch (error) {
      console.error('Failed to send article query:', error);
    }
  };

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);
  const featuredCatData = featured ? CATEGORY_ICONS[featured.category] : null;
  const FeaturedIcon = featuredCatData?.Icon;
  const featuredTag = featured ? TAG_STYLES[featured.tagType] : null;

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AmbientBg />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingBottom: '82px',
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >
        {/* Frosted header */}
        <div
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
            zIndex: 10,
            position: 'relative',
            padding: '0 20px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h2
                style={{
                  fontFamily: typography.fonts.serif,
                  fontSize: '22px',
                  fontWeight: typography.weight.semibold,
                  color: colors.text.primary,
                }}
              >
                {language === 'hi' ? 'खोजें' : 'Explore'}
              </h2>
              <p
                style={{
                  color: 'rgba(20,30,16,0.4)',
                  fontSize: '12px',
                  marginTop: '2px',
                  fontFamily: typography.fonts.sans,
                }}
              >
                {language === 'hi' ? 'अपने खेत के लिए सुझाव और सलाह' : 'Tips & advice for your farm'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLangSheet(true)}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: radii.full,
                padding: '4px 9px',
                fontSize: '11px',
                fontWeight: typography.weight.medium,
                color: colors.text.primary,
                cursor: 'pointer',
                fontFamily: typography.fonts.sans,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              aria-haspopup="dialog"
              aria-expanded={showLangSheet}
            >
              {language === 'hi' ? 'हिन्दी' : 'English'}
              <span style={{ color: 'rgba(20,30,16,0.4)' }}>▾</span>
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div
          style={{
            display: 'flex',
            gap: '7px',
            padding: '12px 16px',
            overflowX: 'auto',
            flexShrink: 0,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {categories.map((cat) => (
            <div key={cat.id} style={{ flex: '0 0 auto' }}>
              <PillChip
                label={cat.label}
                active={selectedCategory === cat.id}
                onPress={() => handleCategoryClick(cat.id)}
              />
            </div>
          ))}
        </div>

        {/* Articles */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 16px 8px',
            scrollbarWidth: 'none',
          }}
        >
          {/* Featured card */}
          {featured && (
            <div
              onClick={() => handleArticleClick(featured)}
              style={{
                background: 'rgba(255,255,255,0.8)',
                borderRadius: radii.xl,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                display: 'flex',
                marginBottom: '14px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '4px',
                  background: featured.accentColor,
                  alignSelf: 'stretch',
                  flexShrink: 0,
                }}
              />
              <div style={{ padding: '16px', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  {featuredCatData && FeaturedIcon && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: featuredCatData.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FeaturedIcon size={17} color={featuredCatData.color} />
                    </div>
                  )}
                  {featuredTag && (
                    <span
                      style={{
                        background: featuredTag.background,
                        color: featuredTag.color,
                        padding: '3px 8px',
                        borderRadius: '100px',
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        fontFamily: typography.fonts.sans,
                      }}
                    >
                      {featuredTag.label[language === 'hi' ? 'hi' : 'en']}
                    </span>
                  )}
                  <span
                    style={{
                      color: 'rgba(20,30,16,0.4)',
                      fontSize: '10px',
                      marginLeft: 'auto',
                      fontFamily: typography.fonts.sans,
                    }}
                  >
                    {featured.readTime} {language === 'hi' ? 'मिनट' : 'min'}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: typography.fonts.serif,
                    fontSize: '15px',
                    color: colors.text.primary,
                    lineHeight: 1.4,
                    marginBottom: '7px',
                  }}
                >
                  {featured.title}
                </h3>
                {featured.description && (
                  <p
                    style={{
                      color: colors.text.secondary,
                      fontSize: '12px',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                      fontFamily: typography.fonts.sans,
                    }}
                  >
                    {featured.description}
                  </p>
                )}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: colors.green.default,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: typography.fonts.sans,
                    padding: 0,
                  }}
                >
                  {language === 'hi' ? 'और पढ़ें →' : 'Read more →'}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#138808"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Article list */}
          {rest.length > 0 && (
            <div
              style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: radii.lg,
                border: '1px solid rgba(0,0,0,0.06)',
                padding: '0 14px',
              }}
            >
              {rest.map((article, idx) => {
                const catData = CATEGORY_ICONS[article.category];
                const ArticleIcon = catData?.Icon;
                const tag = TAG_STYLES[article.tagType];
                return (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: idx < rest.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {catData && ArticleIcon && (
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: radii.sm,
                          background: catData.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ArticleIcon size={18} color={catData.color} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '13px',
                          color: colors.text.primary,
                          lineHeight: 1.3,
                          marginBottom: '4px',
                          fontFamily: typography.fonts.sans,
                        }}
                      >
                        {article.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {tag && (
                          <span
                            style={{
                              background: tag.background,
                              color: tag.color,
                              padding: '3px 8px',
                              borderRadius: '100px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontFamily: typography.fonts.sans,
                            }}
                          >
                            {tag.label[language === 'hi' ? 'hi' : 'en']}
                          </span>
                        )}
                        <span
                          style={{
                            color: 'rgba(20,30,16,0.4)',
                            fontSize: '10px',
                            fontFamily: typography.fonts.sans,
                          }}
                        >
                          {article.readTime} {language === 'hi' ? 'मिनट' : 'min'}
                        </span>
                      </div>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(20,30,16,0.25)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}

          {filteredArticles.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.lg,
                  color: colors.text.secondary,
                }}
              >
                {language === 'hi' ? 'कोई लेख नहीं मिला' : 'No articles found'}
              </p>
            </div>
          )}
        </div>
      </div>

      <LangSheet
        isOpen={showLangSheet}
        currentLang={language}
        onSelect={async (code) => {
          if (code === 'hi' || code === 'en') await setLanguage(code);
          setShowLangSheet(false);
        }}
        onClose={() => setShowLangSheet(false)}
        language={language}
      />

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default ExploreScreen;
